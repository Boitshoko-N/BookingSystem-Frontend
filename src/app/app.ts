import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { navFor } from '../app/navbar/nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a routerLink="/home" class="brand">School Intake Bookings</a>

      @if (auth.session()) {
        <nav class="nav">
          @for (item of nav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
          }
        </nav>
        <div class="user">
          <span>{{ auth.displayName() }} ({{ auth.role() }})</span>
          <button type="button" class="btn small secondary" (click)="auth.logout()">Log out</button>
        </div>
      }
    </header>

    <main class="container">
      <router-outlet />
    </main>
  `
})
export class App {
  auth = inject(AuthService);
  nav = computed(() => navFor(this.auth.role()));
}