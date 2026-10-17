import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { finalize } from 'rxjs';

export const httpAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  authStore.beginHttpRequest();

  return next(
    request.clone({
      withCredentials: true,
      credentials: 'include',
    }),
  ).pipe(finalize(() => authStore.endHttpRequest()));
};
