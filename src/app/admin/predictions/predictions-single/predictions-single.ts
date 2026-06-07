import {ChangeDetectorRef, Component, TemplateRef, ViewChild} from '@angular/core';
import {isClassification, Prediction} from '../../../core/models/prediction';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ApiPredictions} from '../../../core/services/api-predictions';
import {PendingPredictions} from '../../../core/services/pending-predictions';
import {filter, finalize, map, switchMap} from 'rxjs';
import {DatePipe, DecimalPipe, NgClass, NgStyle, PercentPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {
    capitalize,
    formatYear,
    getColor,
    getMatchClass,
    getStatusClass,
    matchExplanation,
} from '../../../core/utils/helpers';
import {ApiImages} from '../../../core/services/api-images';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {
    ClassificationBreakdownChart
} from '../../../reusable/charts/classification-breakdown-chart/classification-breakdown-chart';
import {RegressionBreakdownChart} from '../../../reusable/charts/regression-breakdown-chart/regression-breakdown-chart';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {Alert} from '../../../core/services/alert';
import {FeedbackConnectForm} from '../../../reusable/feedback-connect-form/feedback-connect-form';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {FeedbackCreateForm} from '../../../reusable/feedback-create-form/feedback-create-form';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {Breadcrumb} from '../../../core/services/breadcrumb';

@Component({
  selector: 'app-predictions-single',
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        RouterLink,
        DatePipe,
        NgStyle,
        MatProgressSpinner,
        PercentPipe,
        DecimalPipe,
        NgClass,
        MatButton,
        ClassificationBreakdownChart,
        RegressionBreakdownChart,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatDialogClose,
        FeedbackConnectForm,
        MatTabGroup,
        MatTab,
        FeedbackCreateForm,
        MatFormField,
        MatLabel,
        MatInput,
        MatButtonToggleGroup,
        MatButtonToggle
    ],
  templateUrl: './predictions-single.html',
  styleUrl: './predictions-single.scss',
})
export class PredictionsSingle {
    prediction?: Prediction;
    // Blur Preview (LQIP): thumb appears instantly (usually already cached from the
    // table view) shown blurred, then full replaces it.
    thumbUrl?: string;
    fullUrl?: string;

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    constructor(
        private route: ActivatedRoute,
        private predictionsApi: ApiPredictions,
        private pendingPredictions: PendingPredictions,
        private imagesApi: ApiImages,
        private alert: Alert,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private dialogService: MatDialog,
        private breadcrumb: Breadcrumb,
    ) {}

    ngOnInit(): void {
        this.route.paramMap
            .pipe(
                map(params => Number(params.get('id'))),
                filter(id => !isNaN(id)),
                switchMap(id => this.predictionsApi.getSingle(id))
            )
            .subscribe(prediction => {
                this.prediction = prediction;
                this.cdr.markForCheck();
                this.loadImage(prediction);

                this.breadcrumb.setLabel(this.router.url, `Prediction #${prediction.id}`);
            });
    }

    private loadImage(p: Prediction) {
        if (!p.input_image_path) return;

        // thumb: fast (likely cached) → shown blurred as placeholder
        this.imagesApi.getImage(p.input_image_path, 'thumb').subscribe(blob => {
            this.thumbUrl = URL.createObjectURL(blob);
            this.cdr.markForCheck();
        });
        // full: replaces thumb when loaded
        this.imagesApi.getImage(p.input_image_path, 'full').subscribe(blob => {
            this.fullUrl = URL.createObjectURL(blob);
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy() {
        if (this.thumbUrl) URL.revokeObjectURL(this.thumbUrl);
        if (this.fullUrl) URL.revokeObjectURL(this.fullUrl);
    }

    reloadPrediction() {
        if (!this.prediction) return;

        this.predictionsApi.getSingle(this.prediction.id).subscribe(prediction => {
            this.prediction = prediction;
        });
    }

    get sortedProbabilities(): Array<{ name: string; value: number }> {
        if (!this.prediction || !isClassification(this.prediction) || !this.prediction.breakdown) return [];

        return Object.entries(this.prediction.breakdown.probabilities)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }

    openDeleteDialog() {
        this.dialogService.open(this.deleteDialog, {
            width: '380px',
            disableClose: false,
            autoFocus: false,
        });
    }

    delete(){
        if (!this.prediction) return;
        // Capture before delete — only a pending prediction affects the count.
        const wasPending = this.prediction.status === 'pending';
        this.predictionsApi.delete(this.prediction.id).pipe(
            finalize(() => {
                this.dialogService.closeAll();
            })
        ).subscribe({
            next: () => {
                this.dialogService.closeAll();
                this.alert.success("Prediction deleted successfully");
                if (wasPending) {
                    this.pendingPredictions.refresh();
                }
                this.router.navigate(['/admin/predictions']);
            }
        });
    }



    protected readonly isClassification = isClassification;
    protected readonly getColor = getColor;
    protected readonly formatYear = formatYear;
    protected readonly length = length;
    protected readonly matchExplanation = matchExplanation;
    protected readonly getStatusClass = getStatusClass;
    protected readonly getMatchClass = getMatchClass;
    protected readonly Math = Math;
    protected readonly capitalize = capitalize;
}
