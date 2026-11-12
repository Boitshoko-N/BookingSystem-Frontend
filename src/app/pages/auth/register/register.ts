import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { errorMessage } from '../../../error-messages/error-message';

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Create a parent account</h1>

        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (error()) {
            <div class="alert error">{{ error() }}</div>
          }

          <div class="row">
            <div class="field">
              <label for="firstName">First name</label>
              <input id="firstName" formControlName="firstName" autocomplete="given-name" />
              @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
                <div class="field-error">Required.</div>
              }
            </div>
            <div class="field">
              <label for="lastName">Last name</label>
              <input id="lastName" formControlName="lastName" autocomplete="family-name" />
              @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
                <div class="field-error">Required.</div>
              }
            </div>
          </div>

          <div class="field">
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <div class="field-error">Enter a valid email address.</div>
            }
          </div>

          <div class="field">
            <label for="phoneNumber">Phone number</label>
            <input id="phoneNumber" type="tel" formControlName="phoneNumber" autocomplete="tel" />
            @if (form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid) {
              <div class="field-error">Use digits, spaces or hyphens (7 to 20 characters), with an optional leading +.</div>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <div class="field-error">At least 8 characters, with at least one letter and one digit.</div>
            }
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password" />
            @if (form.controls.confirmPassword.touched && form.hasError('mismatch')) {
              <div class="field-error">The passwords do not match.</div>
            }
          </div>

          <button type="submit" class="btn" [disabled]="saving()">
            {{ saving() ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="muted mt">Already have an account? <a routerLink="/login">Log in</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,20}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,100}$/)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const { confirmPassword, ...request } = this.form.getRawValue();

    this.auth.registerParent(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/login'], { queryParams: { registered: 1 } });
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      }
    });
  }
}