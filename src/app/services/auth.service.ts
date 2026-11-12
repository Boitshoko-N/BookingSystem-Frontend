import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, Parent, RegisterParentRequest, Role } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly storageKey = 'session';

  readonly session = signal<LoginResponse | null>(this.load());
  readonly role = computed<Role | null>(() => this.session()?.role ?? null);
  readonly isParent = computed(() => this.role() === 'Parent');
  readonly isStaff = computed(() => this.role() === 'Admin' || this.role() === 'Clerk');
  readonly displayName = computed(() => this.session()?.displayName ?? '');

  token(): string | null {
    return this.session()?.token ?? null;
  }

  registerParent(request: RegisterParentRequest) {
    return this.http.post<Parent>(`${environment.apiUrl}/Auth/parent/register`, request);
  }

  loginParent(request: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/Auth/parent/login`, request)
      .pipe(tap(response => this.store(response)));
  }

  loginStaff(request: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/Auth/staff/login`, request)
      .pipe(tap(response => this.store(response)));
  }

  logout(sessionExpired = false) {
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
    this.router.navigate(['/login'], { queryParams: sessionExpired ? { expired: 1 } : {} });
  }

  private store(response: LoginResponse) {
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.session.set(response);
  }

  private load(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const session = JSON.parse(raw) as LoginResponse;
      return new Date(session.expiresAtUtc).getTime() > Date.now() ? session : null;
    } catch {
      return null;
    }
  }
}