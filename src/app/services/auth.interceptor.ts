
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, DOCUMENT } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = inject(DOCUMENT).baseURI;
  const api = new URL(environment.apiUrl, baseUrl);
  const target = new URL(req.url, baseUrl);
  const apiPath = api.pathname.replace(/\/+$/, '');
  const path = target.pathname.replace(/\/+$/, '');

  if (target.origin !== api.origin
    || (path !== apiPath && !path.startsWith(apiPath + '/'))
    || path === apiPath + '/auth/login'
    || path === apiPath + '/auth/register') {
    return next(req);
  }

  const auth = inject(AuthService);
  const user = auth.currentUser();
  if (!user) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: 'Bearer ' + user.token }
  })).pipe(tap({
    error: (error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.rejectSession(user);
      }
    }
  }));
};
