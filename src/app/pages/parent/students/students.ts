import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { errorMessage } from '../../../error-messages/error-message';
import { GRADES, HOME_LANGUAGES } from '../../../lists/lists';
import { StudentWithBookings } from '../../../models/models';
import { HhmmPipe } from '../../../shared/hhmm.pipe';

@Component({
  selector: 'app-parent-students',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, HhmmPipe],
  template: `
    <div class="spread">
      <h1>My students</h1>
      <button type="button" class="btn" (click)="startAdd()">Add a student</button>
    </div>

    @if (error()) { <div class="alert error">{{ error() }}</div> }
    @if (message()) { <div class="alert success">{{ message() }}</div> }

    @if (showForm()) {
      <div class="card">
        <h2>{{ editingNo() === null ? 'Add a student' : 'Edit student' }}</h2>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="row">
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
          </div>
          <div class="row">
            <div class="field">
              <label for="grade">Grade applying for</label>
              <input id="grade" formControlName="grade" list="grade-list" />
              <datalist id="grade-list">
                @for (g of grades; track g) { <option [value]="g"></option> }
              </datalist>
              @if (form.controls.grade.touched && form.controls.grade.invalid) {
                <div class="field-error">Required.</div>
              }
            </div>
            <div class="field">
              <label for="homeLanguage">Home language (decides which language test is written)</label>
              <input id="homeLanguage" formControlName="homeLanguage" list="language-list" />
              <datalist id="language-list">
                @for (l of languages; track l) { <option [value]="l"></option> }
              </datalist>
              @if (form.controls.homeLanguage.touched && form.controls.homeLanguage.invalid) {
                <div class="field-error">Required.</div>
              }
            </div>
          </div>
          <div class="btn-row">
            <button type="submit" class="btn" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save' }}</button>
            <button type="button" class="btn secondary" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      </div>
    }

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (students().length === 0) {
      <div class="card empty">You have not added a student yet. Click "Add a student" to start.</div>
    } @else {
      @for (s of students(); track s.studentNo) {
        <div class="card">
          <div class="spread">
            <div>
              <h2>{{ s.firstName }} {{ s.lastName }}</h2>
              <span class="muted">{{ s.grade }} &middot; Home language: {{ s.homeLanguage }}</span>
            </div>
            <div class="btn-row">
              @if (canBook(s)) {
                <a class="btn small" routerLink="/parent/book" [queryParams]="{ studentNo: s.studentNo }">Book assessment</a>
              }
              @if (hasCompleted(s)) {
                <a class="btn small secondary" [routerLink]="['/parent/results', s.studentNo]">View result</a>
              }
              <button type="button" class="btn small secondary" (click)="startEdit(s)">Edit</button>
              @if (s.bookings.length === 0) {
                <button type="button" class="btn small danger" (click)="remove(s)">Remove</button>
              }
            </div>
          </div>

          @if (s.bookings.length > 0) {
            <div class="table-wrap mt">
              <table class="data">
                <thead>
                  <tr><th>Booking number</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  @for (b of s.bookings; track b.bookingId) {
                    <tr>
                      <td class="booking-number">{{ b.bookingNumber }}</td>
                      <td>{{ b.assessmentDate | date: 'EEE d MMM y' }}</td>
                      <td>{{ b.startTime | hhmm }} - {{ b.endTime | hhmm }}</td>
                      <td><span [class]="'badge ' + b.status">{{ b.status }}</span></td>
                      <td><a [routerLink]="['/parent/bookings', b.bookingId]">Details</a></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="muted mt">No bookings yet.</p>
          }
        </div>
      }
    }
  `
})
export class ParentStudentsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  readonly grades = GRADES;
  readonly languages = HOME_LANGUAGES;

  students = signal<StudentWithBookings[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingNo = signal<number | null>(null);
  error = signal('');
  message = signal('');

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    grade: ['', [Validators.required, Validators.maxLength(20)]],
    homeLanguage: ['', [Validators.required, Validators.maxLength(50)]]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.myProfile().subscribe({
      next: profile => {
        this.students.set(profile.students);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  // A student can book only if they have no Confirmed or Completed booking.
  canBook(s: StudentWithBookings): boolean {
    return !s.bookings.some(b => b.status === 'Confirmed' || b.status === 'Completed');
  }

  hasCompleted(s: StudentWithBookings): boolean {
    return s.bookings.some(b => b.status === 'Completed');
  }

  startAdd() {
    this.clearMessages();
    this.editingNo.set(null);
    this.form.reset({ firstName: '', lastName: '', grade: '', homeLanguage: '' });
    this.showForm.set(true);
  }

  startEdit(s: StudentWithBookings) {
    this.clearMessages();
    this.editingNo.set(s.studentNo);
    this.form.reset({
      firstName: s.firstName, lastName: s.lastName, grade: s.grade, homeLanguage: s.homeLanguage
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.saving.set(true);

    const body = this.form.getRawValue();
    const editing = this.editingNo();
    const call = editing === null ? this.api.addStudent(body) : this.api.updateStudent(editing, body);

    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.message.set(editing === null ? 'The student was added.' : 'The student was updated.');
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      }
    });
  }

  remove(s: StudentWithBookings) {
    if (!confirm(`Remove ${s.firstName} ${s.lastName}?`)) return;

    this.clearMessages();
    this.api.deleteStudent(s.studentNo).subscribe({
      next: () => {
        this.message.set('The student was removed.');
        this.load();
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  private clearMessages() {
    this.error.set('');
    this.message.set('');
  }
}