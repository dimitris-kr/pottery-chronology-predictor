import {ChangeDetectorRef, Component} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {Loader} from '../../core/services/loader';
import {ApiPredictions} from '../../core/services/api-predictions';
import {PendingPredictions} from '../../core/services/pending-predictions';
import {Router} from '@angular/router';
import {Alert} from '../../core/services/alert';

@Component({
    selector: 'app-prediction-form',
    imports: [
        MatIconButton,
        MatIcon,
        MatTooltip,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatButtonToggleGroup,
        MatButtonToggle,
        MatButton,
        // JsonPipe,
        AsyncPipe
    ],
    templateUrl: './prediction-form.html',
    styleUrl: './prediction-form.scss',
})
export class PredictionForm {
    form: FormGroup;

    imagePreviewUrl: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        protected loader: Loader,
        private predictionsApi: ApiPredictions,
        private pendingPredictions: PendingPredictions,
        private alert: Alert,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.formBuilder.group(
            {
                text: [''],
                image: [null],
                task: ['classification', Validators.required]
            },
            {
                validators: this.textOrImageRequired
            }
        )
    }

    textOrImageRequired(form: AbstractControl) {
        const text = form.get('text')?.value;
        const image = form.get('image')?.value;

        return text || image ? null : {textOrImageRequired: true};
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        this.form.patchValue({image: file});
        this.form.updateValueAndValidity();

        this.previewImage(file);
    }

    clearImage() {
        this.form.patchValue({image: null});
        this.imagePreviewUrl = null;
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    onFileDrop(event: DragEvent) {
        event.preventDefault();
        const file = event.dataTransfer?.files[0];
        if (!file) return;
        this.form.patchValue({image: file});
        this.form.updateValueAndValidity();

        this.previewImage(file);
    }

    previewImage(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviewUrl = reader.result as string;
            this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
    }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formData = new FormData();

        const values = this.form.value;

        formData.append('task', values.task);

        if (values.text) {
            formData.append('text', values.text);
        }

        if (values.image) {
            formData.append('image', values.image);
        }

        this.predictionsApi.create(formData).subscribe({
            next: prediction => {
                this.alert.success("Prediction created successfully!");
                // New prediction starts as 'pending' → keep the badge/panel count in sync.
                this.pendingPredictions.refresh();
                this.router.navigate(['/admin/predictions', prediction.id]);
            }
        });
    }
}
