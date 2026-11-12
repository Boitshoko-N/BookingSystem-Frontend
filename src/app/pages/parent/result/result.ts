import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { errorMessage } from '../../../error-messages/error-message';
import { AssessmentResult } from '../../../models/models';

@Component({
  selector: 'app-parent-result',
  imports: [RouterLink],
  template: `
    <p><a routerLink="/parent/students">&larr; Back to my students</a></p>
    <h1>Assessment result</h1>

    @if (error()) { <div class="alert error">{{ error() }}</div> }

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (notReady()) {
      <div class="alert info">
        The result is not available yet. It will be emailed to you as soon as the school has finalised it.
      </div>
    } @else if (result(); as r) {
      <div class="card">
        <div class="spread">
          <h2>{{ r.studentName }}</h2>
          <span [class]="'badge ' + r.outcome">{{ r.outcome }}</span>
        </div>
        <p class="muted">Booking number: {{ r.bookingNumber }}</p>

        <table class="data">
          <thead><tr><th>Subject</th><th>Mark</th></tr></thead>
          <tbody>
            <tr><td>Mathematics</td><td>{{ r.mathematicsMark }}%</td></tr>
            <tr><td>English</td><td>{{ r.englishMark }}%</td></tr>
            <tr><td>Home Language ({{ r.homeLanguage }})</td><td>{{ r.homeLanguageMark }}%</td></tr>
          </tbody>
        </table>

        <p class="mt">
          Overall outcome:
          <strong [style.color]="r.outcome === 'Passed' ? 'var(--green)' : 'var(--red)'">{{ r.outcome }}</strong>
        </p>
        <p class="muted">If you have any questions about this result, please contact the school.</p>
      </div>
    }
  `
})
export class ParentResultComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  result = signal<AssessmentResult | null>(null);
  loading = signal(true);
  notReady = signal(false);
  error = signal('');

  ngOnInit() {
    const studentNo = Number(this.route.snapshot.paramMap.get('studentNo'));

    this.api.getResult(studentNo).subscribe({
      next: r => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        if (err.status === 404) this.notReady.set(true);
        else this.error.set(errorMessage(err));
      }
    });
  }
}