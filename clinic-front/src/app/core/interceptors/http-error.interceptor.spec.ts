import '@angular/compiler';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { EnvironmentInjector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ErrorService } from '@core/services/error/error.service';
import { ToastService } from '@share/toast/toast.service';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  it('wraps HTTP errors so components can choose how to display them', () => {
    TestBed.configureTestingModule({
      providers: [ToastService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const toast_service = TestBed.inject(ToastService);
    const original_error = new HttpErrorResponse({
      status: 400,
      error: {
        message: [
          {
            property: 'organizationLogo',
            constraints: {
              whitelistValidation: 'property organizationLogo should not exist',
            },
          },
        ],
        error: 'طلب غير صالح',
      },
    });
    let received_error: unknown;

    runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      httpErrorInterceptor(
        new HttpRequest('POST', '/test', {}),
        () => throwError(() => original_error),
      ).subscribe({ error: (error: unknown) => (received_error = error) }),
    );

    expect(received_error).toBeInstanceOf(ErrorService);
    if (!(received_error instanceof ErrorService)) {
      throw new Error('The HTTP error was not wrapped in ErrorService.');
    }
    expect(received_error.getErrorMessages()).toEqual([
      'طلب غير صالح',
      'organizationLogo: property organizationLogo should not exist',
    ]);

    received_error.show();
    expect(toast_service.messages().at(-1)?.details).toEqual(
      expect.arrayContaining([
        'طلب غير صالح',
        'property organizationLogo should not exist',
      ]),
    );
  });

  it('rethrows non-HTTP errors unchanged', () => {
    TestBed.configureTestingModule({
      providers: [ToastService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const originalError = new Error('Request failed');
    let receivedError: unknown;

    runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      httpErrorInterceptor(
        new HttpRequest('GET', '/test'),
        () => throwError(() => originalError),
      ).subscribe({ error: (error: unknown) => (receivedError = error) }),
    );

    expect(receivedError).toBe(originalError);
  });
});
