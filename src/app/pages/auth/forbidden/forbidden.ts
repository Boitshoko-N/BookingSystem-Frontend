import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Not allowed</h1>
        <p>You do not have permission to open that page.</p>
        <a routerLink="/home" class="btn">Back to home</a>
      </div>
    </div>
  `
})
export class ForbiddenComponent {}