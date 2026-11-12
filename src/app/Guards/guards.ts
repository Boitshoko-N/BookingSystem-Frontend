import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

// Must be logged in.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.session() ? true : router.createUrlTree(['/login']);
};

// Must be logged in AND have one of the allowed roles.
// Usage: canActivate: [roleGuard('Admin', 'Clerk')]
export const roleGuard = (...allowed: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.role();

  if (!role) return router.createUrlTree(['/login']);
  return allowed.includes(role) ? true : router.createUrlTree(['/forbidden']);
};