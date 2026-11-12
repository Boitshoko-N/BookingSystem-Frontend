import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { errorMessage } from '../../../error-messages/error-message';
import { BookingDetails, Slot } from '../../../models/models';
import { HhmmPipe } from '../../../shared/hhmm.pipe';

@Component({
  selector: 'app-parent-booking-detail',
  imports: [RouterLink, DatePipe, HhmmPipe],
  template: `
    <p><a routerLink="/parent/students">&larr; Back to my students</a></p>

    @if (error()) { <div class="alert error">{{ error() }}</div> }
    @if (message()) { <div class="alert success">{{ message() }}</div> }

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (booking(); as b) {
      <div class="card">
        <div class="spread">
          <h1>Booking details</h1>
          <span [class]="'badge ' + b.status">{{ b.status }}</span>
        </div>

        <p class="muted">Your booking number (you will be asked for it at the school):</p>
        <p class="booking-number">{{ b.bookingNumber }}</p>

        <table class="data">
          <tbody>
            <tr><th>Student</th><td>{{ b.studentName }} ({{ b.studentGrade }})</td></tr>
            <tr><th>Home language test</th><td>{{ b.studentHomeLanguage }}</td></tr>
            <tr><th>Date</th><td>{{ b.assessmentDate | date: 'EEEE d MMMM y' }}</td></tr>
            <tr><th>Time</th><td>{{ b.startTime | hhmm }} - {{ b.endTime | hhmm }}</td></tr>
            <tr><th>Booked on</th><td>{{ b.dateMade | date: 'd MMM y, HH:mm' }}</td></tr>
            @if (b.status === 'Cancelled') {
              <tr><th>Cancelled on</th><td>{{ b.cancelledAt | date: 'd MMM y, HH:mm' }}</td></tr>
              @if (b.cancellationReason) {
                <tr><th>Reason</th><td>{{ b.cancellationReason }}</td></tr>
              }
            }
          </tbody>
        </table>

        @if (b.status === 'Completed') {
          <p class="mt"><a class="btn" [routerLink]="['/parent/results', b.studentNo]">View result</a></p>
        }
      </div>

      @if (b.status === 'Confirmed') {
        <div class="card">
          <h2>Change this booking</h2>
          <p class="muted">
            Changes can only be made up to a set number of hours before the assessment.
            After that, please contact the school.
          </p>
          <div class="btn-row">
            <button type="button" class="btn secondary" (click)="toggleReschedule()">Move to another date</button>
            <button type="button" class="btn danger" (click)="toggleCancel()">Cancel booking</button>
          </div>
        </div>

        @if (showReschedule()) {
          <div class="card">
            <h2>Choose a new date and time</h2>
            @if (otherSlots().length === 0) {
              <p class="empty">There are no other slots available at the moment.</p>
            } @else {
              <div class="table-wrap">
                <table class="data">
                  <thead><tr><th></th><th>Date</th><th>Time</th><th>Places left</th></tr></thead>
                  <tbody>
                    @for (s of otherSlots(); track s.slotId) {
                      <tr>
                        <td>
                          <input type="radio" name="newslot" [checked]="selectedSlot() === s.slotId"
                                 (change)="selectedSlot.set(s.slotId)" />
                        </td>
                        <td>{{ s.assessmentDate | date: 'EEEE d MMMM y' }}</td>
                        <td>{{ s.startTime | hhmm }} - {{ s.endTime | hhmm }}</td>
                        <td>{{ s.availablePlaces }} of {{ s.maxBookings }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <button type="button" class="btn mt" [disabled]="selectedSlot() === 0 || saving()" (click)="reschedule()">
                {{ saving() ? 'Saving...' : 'Confirm new date' }}
              </button>
            }
          </div>
        }

        @if (showCancel()) {
          <div class="card">
            <h2>Cancel this booking</h2>
            <div class="field">
              <label for="reason">Reason (optional)</label>
              <textarea id="reason" rows="3" maxlength="250"
                        (input)="reason.set($any($event.target).value)"></textarea>
            </div>
            <button type="button" class="btn danger" [disabled]="saving()" (click)="cancel()">
              {{ saving() ? 'Cancelling...' : 'Yes, cancel the booking' }}
            </button>
          </div>
        }
      }
    }
  `
})
export class ParentBookingDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  private bookingId = Number(this.route.snapshot.paramMap.get('id'));

  booking = signal<BookingDetails | null>(null);
  otherSlots = signal<Slot[]>([]);
  selectedSlot = signal(0);
  reason = signal('');
  showReschedule = signal(false);
  showCancel = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  message = signal('');

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.has('created')) {
      this.message.set('Your booking is confirmed. A confirmation email has been sent to you.');
    }

    this.api.getBooking(this.bookingId).subscribe({
      next: b => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  toggleReschedule() {
    this.clearMessages();
    this.showCancel.set(false);
    const open = !this.showReschedule();
    this.showReschedule.set(open);
    if (open) this.loadSlots();
  }

  toggleCancel() {
    this.clearMessages();
    this.showReschedule.set(false);
    this.showCancel.update(v => !v);
  }

  private loadSlots() {
    this.selectedSlot.set(0);
    this.api.availableSlots().subscribe({
      next: slots => {
        const currentSlot = this.booking()?.slotId;
        this.otherSlots.set(slots.filter(s => s.slotId !== currentSlot));
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  reschedule() {
    if (this.selectedSlot() === 0) return;

    this.clearMessages();
    this.saving.set(true);

    this.api.reschedule(this.bookingId, this.selectedSlot()).subscribe({
      next: updated => {
        this.saving.set(false);
        this.booking.set(updated);
        this.showReschedule.set(false);
        this.message.set('Your booking was moved. Your booking number has not changed. An email has been sent to you.');
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
        if (err.status === 409) this.loadSlots(); // the list may be out of date
      }
    });
  }

  cancel() {
    this.clearMessages();
    this.saving.set(true);

    this.api.cancelBooking(this.bookingId, this.reason().trim()).subscribe({
      next: updated => {
        this.saving.set(false);
        this.booking.set(updated);
        this.showCancel.set(false);
        this.message.set('Your booking was cancelled. A confirmation email has been sent to you.');
      },
      error: err => {
        this.saving.set(false);
        this.error.set(errorMessage(err));
      }
    });
  }

  private clearMessages() {
    this.error.set('');
    this.message.set('');
  }
}