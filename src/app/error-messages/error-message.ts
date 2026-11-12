import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Cannot reach the server. Please check your connection and try again.';
    if (error.status === 401) return error.error?.detail ?? 'Your session has expired. Please log in again.';
    if (error.status === 403) return 'You do not have permission to do this.';
    return error.error?.detail ?? 'Something went wrong. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}