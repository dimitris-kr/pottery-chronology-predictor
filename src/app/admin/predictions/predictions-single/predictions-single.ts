import {ChangeDetectorRef, Component, TemplateRef, ViewChild} from '@angular/core';
import {isClassification, Prediction} from '../../../core/models/prediction';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ApiPredictions} from '../../../core/services/api-predictions';
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
    imageUrl?: string;

    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

    constructor(
        private route: ActivatedRoute,
        private predictionsApi: ApiPredictions,
        private imagesApi: ApiImages,
        private alert: Alert,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private dialogService: MatDialog
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
            });
    }

    private loadImage(p: Prediction) {
        if (!p.input_image_path) return;

        this.imagesApi.getImage(p.input_image_path, 'full').subscribe(blob => {
            this.imageUrl = URL.createObjectURL(blob);
            this.cdr.markForCheck();
        });
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
        this.predictionsApi.delete(this.prediction.id).pipe(
            finalize(() => {
                this.dialogService.closeAll();
            })
        ).subscribe({
            next: () => {
                this.dialogService.closeAll();
                this.alert.success("Prediction deleted successfully");
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
