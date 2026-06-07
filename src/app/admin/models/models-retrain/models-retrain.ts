import {Component, EventEmitter, inject, Output, TemplateRef, ViewChild} from '@angular/core';
import {RetrainEligibility} from '../../../core/services/retrain-eligibility';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {NgClass} from '@angular/common';
import {ApiModelsRetrain} from '../../../core/services/api-models-retrain';
import {Alert} from '../../../core/services/alert';
import {JobStatus, RetrainStarted, RunStatus} from '../../../core/models/model-retrain';
import {interval, Subscription, switchMap, takeWhile} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

type UIState = 'idle' | 'triggering' | 'running' | 'finalizing' | 'done';

// Polling Modal job status config
const POLL_INTERVAL_MS = 4000;
const MAX_NOT_FOUND_POLLS = 5;

// Polling webhook → DB Finalization status config
// quick -> poll faster but cap the wait.
const FINALIZE_POLL_INTERVAL_MS = 2000;
const MAX_FINALIZE_POLLS = 10;

@Component({
    selector: 'app-models-retrain',
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        MatDialogTitle,
        MatDialogContent,
        NgClass,
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatProgressSpinner
    ],
    templateUrl: './models-retrain.html',
    styleUrl: './models-retrain.scss'
})
export class ModelsRetrain {
    @Output() retrained = new EventEmitter<void>();

    @ViewChild('confirmDialog') confirmDialog!: TemplateRef<unknown>;

    /** Shared eligibility — same source the sidebar badge reads from. */
    protected readonly eligibility = inject(RetrainEligibility);

    uiState: UIState = 'idle';

    triggerResponse: RetrainStarted | null = null;

    private pollSub: Subscription | null = null;
    private notFoundCount = 0;
    private finalizeAttempts = 0;

    constructor(
        private retrainApi: ApiModelsRetrain,
        private alert: Alert,
        private dialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.eligibility.refresh();
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    /** True while a retrain is in progress. */
    get busy(): boolean {
        return this.uiState === 'triggering' || this.uiState === 'running' || this.uiState === 'finalizing';
    }

    get newVersion(): string | null {
        return this.triggerResponse ? this.triggerResponse.new_version : null;
    }

    /** New items present but below the soft (backend-computed) recommendation. */
    belowThreshold(): boolean {
        return (
            this.eligibility.eligible() &&
            this.eligibility.newItemsCount() < this.eligibility.recommendedThreshold()
        );
    }

    openConfirm() {
        if (this.busy || !this.eligibility.eligible()) return;
        this.dialog.open(this.confirmDialog, {width: '680px', autoFocus: false});
    }

    confirmRetrain() {
        if (this.busy || !this.eligibility.eligible()) return;

        this.dialog.closeAll();
        this.startRetrain();
    }

    private startRetrain() {
        this.uiState = 'triggering';
        this.retrainApi.trigger().subscribe({
            next: triggerResponse => {
                this.uiState = 'running';
                this.triggerResponse = triggerResponse;
                this.notFoundCount = 0;
                this.startPolling(triggerResponse.job_id);
            },
            // The error interceptor already surfaces the backend message
            // (e.g. the 409 "no new validated items" detail). We only re-sync
            // local UI state here.
            error: (err: HttpErrorResponse) => {
                this.uiState = 'idle';
                if (err.status === 409) this.eligibility.refresh();
            },
        });
    }

    // ── Phase 1: poll the Modal job ──────────────────────────────────────────

    private startPolling(jobId: string) {
        this.stopPolling();
        this.pollSub = interval(POLL_INTERVAL_MS)
            .pipe(
                switchMap(() => this.retrainApi.getStatus(jobId)),
                takeWhile(jobStatus => this.shouldKeepPollingModalJob(jobStatus.status), true),
            )
            .subscribe({
                next: jobStatus => this.handleStatus(jobStatus),
                // Transport error on the poll itself → interceptor shows it; just
                // reset state so the user can retry.
                error: () => {
                    this.stopPolling();
                    this.uiState = 'idle';
                },
            });
    }

    private shouldKeepPollingModalJob(status: string): boolean {
        // Returns true if Modal job started running or hasn't been registered yet

        // Case: Modal job started running
        if (status === 'running') return true;

        // Case: Modal may not register the job for the first few polls — keep going for a short grace period.
        if (status !== 'not_found') return false;
        this.notFoundCount += 1;
        return this.notFoundCount <= MAX_NOT_FOUND_POLLS;
    }

    private handleStatus(jobStatus: JobStatus) {
        console.log(`>> modal job status: ${jobStatus.status}`);
        if (jobStatus.status === 'running') return;
        if (jobStatus.status === 'not_found' && this.notFoundCount <= MAX_NOT_FOUND_POLLS) return;

        this.stopPolling();

        if (jobStatus.status === 'success') {
            // Modal finished — but the DB isn't promoted until the webhook runs
            // finalize_retrain. Move to phase 2 and confirm before declaring done.
            const trainingRunId = this.triggerResponse?.new_training_run.id;
            if (trainingRunId == null) {
                this.uiState = 'idle';
                this.alert.error('Training finished but its run id is missing — cannot confirm finalization.');
                return;
            }
            this.uiState = 'finalizing';
            this.startFinalizePolling(trainingRunId);
            return;
        }

        // `failure` and post-grace `not_found` come back as HTTP 200 bodies, so
        // the error interceptor never sees them — surface the message ourselves.
        this.uiState = 'idle';
        if (jobStatus.status === 'failure') {
            this.alert.error(`Training failed with error: ${jobStatus.error ?? 'unknown error'}`);
        } else {
            this.alert.error('Training job not found. It may have expired before completing.');
        }
    }

    // ── Phase 2: poll the DB finalization (TrainingRun promotion) ────────────

    private startFinalizePolling(trainingRunId: number) {
        this.stopPolling();
        this.finalizeAttempts = 0;
        this.pollSub = interval(FINALIZE_POLL_INTERVAL_MS)
            .pipe(
                switchMap(() => this.retrainApi.getRunStatus(trainingRunId)),
                takeWhile(runStatus => this.shouldKeepPollingFinalize(runStatus.status), true),
            )
            .subscribe({
                next: runStatus => this.handleRunStatus(runStatus),
                error: () => {
                    this.stopPolling();
                    this.uiState = 'idle';
                },
            });
    }

    private shouldKeepPollingFinalize(status: string): boolean {
        if (status !== 'finalizing') return false;
        this.finalizeAttempts += 1;
        return this.finalizeAttempts < MAX_FINALIZE_POLLS;
    }

    private handleRunStatus(runStatus: RunStatus) {
        console.log(`>> finalize status: ${runStatus.status}`);

        // Keep waiting while still finalizing and under the cap.
        if (runStatus.status === 'finalizing' && this.finalizeAttempts < MAX_FINALIZE_POLLS) return;

        this.stopPolling();

        const v = this.newVersion ?? 'New version of';

        if (runStatus.status === 'finalized') {
            // Set eligibility optimistically first (no stale-count), until refresh confirms from backend.
            this.eligibility.markRetrained();
            this.eligibility.refresh();

            this.uiState = 'done';
            this.alert.success(`Retraining finished! ${v} models now live.`);

            // reload the model version tables
            this.retrained.emit();

            return;
        }

        if (runStatus.status === 'failed') {
            this.uiState = 'idle';
            this.alert.error('Retraining failed during finalization. The previous version is restored.');
            this.eligibility.refresh();
            return;
        }

        if (runStatus.status === 'archived') {
            // Defensive: the tracked run was superseded by a newer one. Not
            // reachable in normal single-flight use (the button is disabled while
            // busy), but if it happens the DB has moved on — just resync.
            this.uiState = 'idle';
            this.eligibility.refresh();
            this.retrained.emit();
            return;
        }

        // Still 'finalizing' after MAX_FINALIZE_POLLS → webhook hasn't landed in time. The
        // job likely succeeded; just not confirmed live yet.
        this.uiState = 'idle';
        this.alert.info(`${v} models finished training but aren't live yet - refresh in a moment.`);
    }

    private stopPolling() {
        this.pollSub?.unsubscribe();
        this.pollSub = null;
    }
}
