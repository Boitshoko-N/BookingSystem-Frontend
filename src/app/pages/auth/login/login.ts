import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { errorMessage } from '../../../error-messages/error-message';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Log in</h1>

        @if (expired) {
          <div class="alert warn">Your session has expired. Please log in again.</div>
        }
        @if (registered) {
          <div class="alert success">Your account was created. Please log in.</div>
        }

        <div class="btn-row">
          <button type="button" class="btn small" [class.secondary]="mode() !== 'parent'" (click)="mode.set('parent')">
            Parent
          </button>
          <button type="button" class="btn small" [class.secondary]="mode() !== 'staff'" (click)="mode.set('staff')">
            School staff
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt">
          @if (error()) {
            <div class="alert error">{{ error() }}</div>
          }

          <div class="field">
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" autocomplete="username" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <div class="field-error">Enter a valid email address.</div>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <div class="field-error">Enter your password.</div>
            }
          </div>

          <button type="submit" class="btn" [disabled]="saving()">
            {{ saving() ? 'Logging in...' : 'Log in' }}
          </button>
        </form>

        @if (mode() === 'parent') {
          <p class="muted mt">New here? <a routerLink="/register">Create a parent account</a></p>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<'parent' | 'staff'>('parent');
  saving = signal(false);
  error = signal('');

  expired = this.route.snapshot.queryParamMap.has('expired');
  registered = this.route.snapshot.queryParamMap.has('registered');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const request = this.form.getRawValue();
    const call = this.mode() === 'parent'
      ? this.auth.loginParent(request)
      : this.auth.loginStaff(request);

    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      }
    });
  }
}