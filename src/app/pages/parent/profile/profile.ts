import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { errorMessage } from '../../../error-messages/error-message';

@Component({
  selector: 'app-parent-profile',
  imports: [ReactiveFormsModule],
  template: `
    <h1>My details</h1>

    <div class="card" style="max-width: 520px">
      @if (error()) { <div class="alert error">{{ error() }}</div> }
      @if (message()) { <div class="alert success">{{ message() }}</div> }

      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="field">
          <label for="email">Email address</label>
          <input id="email" [value]="email()" disabled />
          <div class="muted">Your email is your login, so it cannot be changed here.</div>
        </div>

        <div class="field">
          <label for="firstName">First name</label>
          <input id="firstName" formControlName="firstName" />
          @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
            <div class="field-error">Required.</div>
          }
        </div>

        <div class="field">
          <label for="lastName">Last name</label>
          <input id="lastName" formControlName="lastName" />
          @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
            <div class="field-error">Required.</div>
          }
        </div>

        <div class="field">
          <label for="phoneNumber">Phone number</label>
          <input id="phoneNumber" type="tel" formControlName="phoneNumber" />
          @if (form.controls.phoneNumber.touched && form.controls.phoneNumber.invalid) {
            <div class="field-error">Use digits, spaces or hyphens (7 to 20 characters), with an optional leading +.</div>
          }
        </div>

        <button type="submit" class="btn" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save changes' }}</button>
      </form>
    </div>
  `
})
export class ParentProfileComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  email = signal('');
  saving = signal(false);
  error = signal('');
  message = signal('');

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,20}$/)]]
  });

  ngOnInit() {
    this.api.myProfile().subscribe({
      next: p => {
        this.email.set(p.email);
        this.form.reset({ firstName: p.firstName, lastName: p.lastName, phoneNumber: p.phoneNumber });
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.message.set('');
    this.saving.set(true);

    this.api.updateMyProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Your details were saved. Your name in the top bar will update the next time you log in.');
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      }
    });
  }
}