import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { errorMessage } from '../../../error-messages/error-message';
import { Slot, StudentWithBookings } from '../../../models/models';
import { HhmmPipe } from '../../../shared/hhmm.pipe';

@Component({
  selector: 'app-parent-book',
  imports: [RouterLink, DatePipe, HhmmPipe],
  template: `
    <h1>Book an assessment</h1>

    @if (error()) { <div class="alert error">{{ error() }}</div> }

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (eligible().length === 0) {
      <div class="card">
        <p>
          There is no student who can be booked right now. A student needs to be added first, and a student
          who already has a confirmed or completed booking cannot book again.
        </p>
        <a routerLink="/parent/students" class="btn">Go to my students</a>
      </div>
    } @else {
      <div class="card">
        <h2>1. Choose the student</h2>
        <div class="field">
          <label for="student">Student</label>
          <select id="student" (change)="selectedStudent.set(+$any($event.target).value)">
            <option value="0" [selected]="selectedStudent() === 0">Select a student</option>
            @for (s of eligible(); track s.studentNo) {
              <option [value]="s.studentNo" [selected]="selectedStudent() === s.studentNo">
                {{ s.firstName }} {{ s.lastName }} ({{ s.grade }})
              </option>
            }
          </select>
        </div>
      </div>

      <div class="card">
        <h2>2. Choose a date and time</h2>
        @if (slots().length === 0) {
          <p class="empty">There are no slots available at the moment. Please check again later.</p>
        } @else {
          <div class="table-wrap">
            <table class="data">
              <thead>
                <tr><th></th><th>Date</th><th>Time</th><th>Places left</th></tr>
              </thead>
              <tbody>
                @for (s of slots(); track s.slotId) {
                  <tr>
                    <td>
                      <input type="radio" name="slot" [checked]="selectedSlot() === s.slotId"
                             (change)="selectedSlot.set(s.slotId)" [attr.aria-label]="'Select ' + s.assessmentDate" />
                    </td>
                    <td>{{ s.assessmentDate | date: 'EEEE d MMMM y' }}</td>
                    <td>{{ s.startTime | hhmm }} - {{ s.endTime | hhmm }}</td>
                    <td>{{ s.availablePlaces }} of {{ s.maxBookings }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <button type="button" class="btn" [disabled]="!canSubmit() || saving()" (click)="submit()">
        {{ saving() ? 'Booking...' : 'Confirm booking' }}
      </button>
      <p class="muted mt">A confirmation email with your booking number will be sent to you.</p>
    }
  `
})
export class ParentBookComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  students = signal<StudentWithBookings[]>([]);
  slots = signal<Slot[]>([]);
  selectedStudent = signal(0);
  selectedSlot = signal(0);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  eligible = computed(() =>
    this.students().filter(s => !s.bookings.some(b => b.status === 'Confirmed' || b.status === 'Completed')));

  canSubmit = computed(() => this.selectedStudent() > 0 && this.selectedSlot() > 0);

  ngOnInit() {
    forkJoin({ profile: this.api.myProfile(), slots: this.api.availableSlots() }).subscribe({
      next: ({ profile, slots }) => {
        this.students.set(profile.students);
        this.slots.set(slots);

        // Preselect the student when arriving from "Book assessment" on the students page.
        const wanted = Number(this.route.snapshot.queryParamMap.get('studentNo'));
        if (wanted && this.eligible().some(s => s.studentNo === wanted)) {
          this.selectedStudent.set(wanted);
        }
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  submit() {
    if (!this.canSubmit()) return;

    this.saving.set(true);
    this.error.set('');

    this.api.book(this.selectedStudent(), this.selectedSlot()).subscribe({
      next: booking => {
        this.saving.set(false);
        this.router.navigate(['/parent/bookings', booking.bookingId], { queryParams: { created: 1 } });
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));

        // The slot list is probably out of date (someone else took the last place), so refresh it.
        if (err.status === 409) {
          this.selectedSlot.set(0);
          this.api.availableSlots().subscribe({ next: slots => this.slots.set(slots) });
        }
      }
    });
  }
}