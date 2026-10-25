import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '@core/services/error/error.service';
import { ToastService } from '@share/toast/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast_service = inject(ToastService);
  const is_browser = isPlatformBrowser(inject(PLATFORM_ID));

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      return throwError(
        () => new ErrorService({ error, toastService: toast_service, isBrowser: is_browser }),
      );
    }),
  );
};
