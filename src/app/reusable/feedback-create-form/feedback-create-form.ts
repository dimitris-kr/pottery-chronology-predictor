import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import {ApiPredictions} from '../../core/services/api-predictions';
import {PotteryItemCreateFromPredictionRequest} from '../../core/models/pottery-item';
import {toSignedYear} from '../../core/utils/helpers';
import {Alert} from '../../core/services/alert';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {FormFieldError} from '../../core/services/form-field-error';

@Component({
    selector: 'app-feedback-create-form',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatSelect,
        MatOption,
        MatButton
    ],
    templateUrl: './feedback-create-form.html',
    styleUrl: './feedback-create-form.scss',
})
export class FeedbackCreateForm {
    @Input({required: true})
    predictionId!: number;

    @Output()
    created: EventEmitter<void> = new EventEmitter<void>();

    form: FormGroup;

    eras: string[] = ['BCE', 'CE'];

    constructor(
        private fb: FormBuilder,
        private predictionsApi: ApiPredictions,
        private alert: Alert,
        protected ffError: FormFieldError,
    ) {
        this.form = this.fb.group(
            {
                object_id: [null as string | null],

                start_year: [null as number | null, [Validators.required, Validators.min(0)]],
                start_era: ['BCE', Validators.required],

                end_year: [null as number | null, [Validators.required, Validators.min(0)]],
                end_era: ['BCE', Validators.required],
            },
            {
                validators: [this.chronologyRangeValidator()],
            }
        );
    }

    chronologyRangeValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const startYear = control.get('start_year')?.value;
            const startEra = control.get('start_era')?.value;
            const endYear = control.get('end_year')?.value;
            const endEra = control.get('end_era')?.value;

            if (
                startYear === null ||
                endYear === null ||
                !startEra ||
                !endEra
            ) {
                return null;
            }

            if (toSignedYear(startYear, startEra) <= toSignedYear(endYear, endEra)) {
                return null;
            } else {
                control.get('end_year')?.setErrors({
                    ...control.get('end_year')?.errors,
                    invalidChronologyRange: true
                });
                return { invalidChronologyRange: true };
            }
        };
    }

    submit() {
        if (this.form.invalid || !this.predictionId) {
            this.form.markAllAsTouched();
            return;
        }

        const values = this.form.value;

        const payload: PotteryItemCreateFromPredictionRequest = {
            object_id: values.object_id || null,
            start_year: toSignedYear(values.start_year!, values.start_era!),
            end_year: toSignedYear(values.end_year!, values.end_era!),
        };

        this.predictionsApi
            .giveFeedbackCreate(this.predictionId, payload)
            .subscribe({
                next: () => {
                    this.alert.success("Feedback Submitted Successfully! New pottery item created.");
                    this.created.emit();
                },
            });
    }
}
