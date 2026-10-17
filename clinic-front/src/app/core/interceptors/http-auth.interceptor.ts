import { HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { finalize } from 'rxjs';

export const httpAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const document = inject(DOCUMENT);
  const authStore = inject(AuthStore);
  const language = document.documentElement?.lang === 'ar' ? 'ar' : 'en';
  authStore.beginHttpRequest();

  return next(
    request.clone({
      setHeaders: { 'Accept-Language': language },
      withCredentials: true,
      credentials: 'include',
    }),
  ).pipe(finalize(() => authStore.endHttpRequest()));
};
