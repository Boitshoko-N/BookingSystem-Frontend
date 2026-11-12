import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

// Usage: { path: 'admin/staff', canActivate: [roleGuard('Admin')], ... }
export const roleGuard = (...allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.role();

  if (!role) return router.createUrlTree(['/login']);
  return allowed.includes(role) ? true : router.createUrlTree(['/forbidden']);
};