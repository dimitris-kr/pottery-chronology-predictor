import {Component} from '@angular/core';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Auth} from '../../core/services/auth';
import {Alert} from '../../core/services/alert';
import {FormFieldError} from '../../core/services/form-field-error';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Loader} from '../../core/services/loader';
import {AsyncPipe} from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [
        MatFormField,
        MatFormFieldModule,
        MatLabel,
        MatIcon,
        MatIconModule,
        MatInput,
        MatIconButton,
        ReactiveFormsModule,
        MatButton,
        MatError,
        AsyncPipe
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    form: FormGroup;

    hidePassword: boolean = true;

    returnUrl: string = '/admin'; // fallback

    constructor(
        private fb: FormBuilder,
        private auth: Auth,
        private alert: Alert,
        private router: Router,
        private route: ActivatedRoute,
        protected ffError: FormFieldError,
        protected loader: Loader,
    ) {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });

        // ✅ Read returnUrl from query params
        const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (queryReturnUrl) {
            this.returnUrl = queryReturnUrl;
        }
    }

    togglePasswordVisibility(event: MouseEvent) {
        this.hidePassword = !this.hidePassword;
        event.stopPropagation();
    }

    submit() {
        if (this.form.invalid) return;


        const { username, password } = this.form.value;

        this.auth.login(username, password)
            .subscribe({
                next: () => {
                    this.alert.success('Login successful');
                    queueMicrotask(() => {
                        this.router.navigateByUrl(this.returnUrl);
                    });
                },
                error: (err) => {
                    this.alert.error(
                        err?.error?.detail || 'Invalid username or password'
                    );
                },
            });
    }
}
