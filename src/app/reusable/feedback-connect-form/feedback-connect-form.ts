import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
    combineLatest,
    combineLatestWith, debounceTime, distinctUntilChanged, filter, map, Observable, startWith, switchMap
} from 'rxjs';
import {PotteryItem, PotteryItemBase} from '../../core/models/pottery-item';
import {ApiPredictions} from '../../core/services/api-predictions';
import {PendingPredictions} from '../../core/services/pending-predictions';
import {ApiPotteryItems} from '../../core/services/api-pottery-items';
import {MatError, MatFormField, MatHint, MatInput, MatLabel} from '@angular/material/input';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatButton, MatIconButton} from '@angular/material/button';
import {AsyncPipe} from '@angular/common';
import {Loader} from '../../core/services/loader';
import {formatYear} from '../../core/utils/helpers';
import {MatIcon} from '@angular/material/icon';
import {Alert} from '../../core/services/alert';

@Component({
  selector: 'app-feedback-connect-form',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatButton,
        AsyncPipe,
        MatHint,
        MatError,
        MatIconButton,
        MatIcon
    ],
  templateUrl: './feedback-connect-form.html',
  styleUrl: './feedback-connect-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackConnectForm {
    @Input({ required: true })
    predictionId!: number;

    @Output()
    connected: EventEmitter<void> = new EventEmitter<void>();

    form: FormGroup;

    searchControl = new FormControl('');
    results$: Observable<PotteryItemBase[]> | null = null;

    selectedItem: PotteryItem | null = null;

    constructor(
        private fb: FormBuilder,
        private predictionsApi: ApiPredictions,
        private pendingPredictions: PendingPredictions,
        private potteryItemsApi: ApiPotteryItems,
        protected loader: Loader,
        private alert: Alert,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            pottery_item_id: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.results$ = this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(value => typeof value === 'string' && value.length >= 2),
            switchMap(value => value ? this.potteryItemsApi.searchPotteryItems(value): [])
        );

        this.results$.subscribe(results => {
            const value = this.searchControl.value;

            if (
                typeof value === 'string' &&
                value.length >= 2 &&
                results.length === 0
            ) {
                this.searchControl.setErrors({ noResults: true });
            } else {
                if (this.searchControl.hasError('noResults')) {
                    this.searchControl.setErrors(null);
                }
            }
        });
    }

    displayFn(item: PotteryItemBase): string {
        return item ? item.object_id ? item.object_id : '' : '';
    }

    onOptionSelected(item: PotteryItemBase) {
        this.potteryItemsApi.getSingle(item.id).subscribe(potteryItem => {
            this.selectedItem = potteryItem;
            this.form.patchValue({ pottery_item_id: potteryItem.id });
            this.cdr.markForCheck();
        });
    }

    resetSelection() {
        this.selectedItem = null;

        // Reset form
        this.form.reset();

        // Clear search input
        this.searchControl.reset('');
        this.searchControl.setErrors(null);

        // Force UI update (OnPush)
        this.cdr.markForCheck();
    }

    submit() {
        if (this.form.invalid || !this.predictionId) {
            this.form.markAllAsTouched();
            return;
        }

        this.predictionsApi
            .giveFeedbackConnect(this.predictionId, this.form.value.pottery_item_id)
            .subscribe({
                next: () => {
                    this.alert.success("Feedback Submitted Successfully! Prediction connected to existing pottery item.");
                    // Prediction is now validated → drop the pending count
                    this.pendingPredictions.refresh();
                    this.connected.emit();
                },
            });
    }

    protected readonly formatYear = formatYear;
}
