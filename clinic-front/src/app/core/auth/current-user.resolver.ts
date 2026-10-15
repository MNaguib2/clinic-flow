import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthStore, AuthUser } from './auth.store';

export const currentUserResolver: ResolveFn<AuthUser | null> = () => {
  const store = inject(AuthStore);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) return of(null);

  return store.initialize().pipe(map(() => store.user()));
};
