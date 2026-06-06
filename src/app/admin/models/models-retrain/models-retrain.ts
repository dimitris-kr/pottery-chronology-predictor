import {Component, inject, TemplateRef, ViewChild} from '@angular/core';
import {RetrainEligibility} from '../../../core/services/retrain-eligibility';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {NgClass} from '@angular/common';
import {ApiModelsRetrain} from '../../../core/services/api-models-retrain';
import {Alert} from '../../../core/services/alert';

type UIState = 'idle' | 'running' | 'done';


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
        MatDialogClose
    ],
    templateUrl: './models-retrain.html',
    styleUrl: './models-retrain.scss'
})
export class ModelsRetrain {
    @ViewChild('confirmDialog') confirmDialog!: TemplateRef<unknown>;

    /** Shared eligibility — same source the sidebar badge reads from. */
    protected readonly eligibility = inject(RetrainEligibility);

    uiState: UIState = 'idle';

    constructor(
        private retrainApi: ApiModelsRetrain,
        private alert: Alert,
        private dialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.eligibility.refresh();
    }

    /** New items present but below the soft (backend-computed) recommendation. */
    belowThreshold(): boolean {
        return (
            this.eligibility.eligible() &&
            this.eligibility.newItemsCount() < this.eligibility.recommendedThreshold()
        );
    }

    openConfirm() {
        if (this.uiState === 'running' || !this.eligibility.eligible()) return;
        this.dialog.open(this.confirmDialog, {width: '680px', autoFocus: false});
    }
}
