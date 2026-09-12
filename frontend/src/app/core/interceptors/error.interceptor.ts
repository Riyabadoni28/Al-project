import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Client Error: ${error.error.message}`;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the backend server. Please verify Python FastAPI server is running on port 8001.';
      } else if (error.error && error.error.message) {
        // Backend returned error response
        errorMessage = error.error.message;
      } else if (error.error && error.error.detail) {
        // FastAPI returns 'detail' instead of 'message'
        errorMessage = error.error.detail;
      } else {
        errorMessage = `Server Error (${error.status}): ${error.statusText}`;
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });

      return throwError(() => new Error(errorMessage));
    })
  );
};
