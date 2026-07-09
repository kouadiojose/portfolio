import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/** Attaches the JWT to API calls and kicks the user back to the
 *  admin login page when the backend answers 401 on an admin route. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;
  const authenticated =
    token && (req.url.startsWith('/api/admin') || req.url.startsWith('/api/auth'))
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authenticated).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith('/api/admin')) {
        auth.logout();
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    })
  );
};
