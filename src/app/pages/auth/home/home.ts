import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { navFor } from '../../../navbar/nav';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h1>Welcome, {{ auth.displayName() }}</h1>

    <div class="grid">
      @for (item of items(); track item.path) {
        <a class="tile" [routerLink]="item.path">
          <strong>{{ item.label }}</strong>
          <span class="muted">{{ item.description }}</span>
        </a>
      }
    </div>
  `
})
export class HomeComponent {
  auth = inject(AuthService);
  items = computed(() => navFor(this.auth.role()));
}