import { HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  it('rethrows the original error for the caller to handle', () => {
    const originalError = new Error('Request failed');
    let receivedError: unknown;

    httpErrorInterceptor(
      new HttpRequest('GET', '/test'),
      () => throwError(() => originalError),
    ).subscribe({ error: (error: unknown) => (receivedError = error) });

    expect(receivedError).toBe(originalError);
  });
});
