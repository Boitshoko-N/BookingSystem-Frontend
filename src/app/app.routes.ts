import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '../app/Guards/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'login',
    loadComponent: () => import('../app/pages/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('../app/pages/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('../app/pages/auth/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () => import('../app/pages/auth/forbidden/forbidden').then(m => m.ForbiddenComponent)
  },

  // ---------- Parent ----------
  {
    path: 'parent',
    canActivate: [roleGuard('Parent')],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'students' },
      {
        path: 'students',
        loadComponent: () => import('../app/pages/parent/students/students').then(m => m.ParentStudentsComponent)
      },
      {
        path: 'book',
        loadComponent: () => import('../app/pages/parent/book/book').then(m => m.ParentBookComponent)
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('../app/pages/parent/booking-detail/booking-detail').then(m => m.ParentBookingDetailComponent)
      },
      {
        path: 'results/:studentNo',
        loadComponent: () => import('../app/pages/parent/result/result').then(m => m.ParentResultComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../app/pages/parent/profile/profile').then(m => m.ParentProfileComponent)
      }
    ]
  },

  // ---- Staff routes are added in Stages F3 and F4 ----
  // ---- Admin routes are added in Stage F4 ----

  { path: '**', redirectTo: 'home' }
];