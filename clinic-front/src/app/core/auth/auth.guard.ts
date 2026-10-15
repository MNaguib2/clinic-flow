import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  return store
    .initialize()
    .pipe(map((isAuthenticated) => (isAuthenticated ? true : router.createUrlTree(['/login']))));
};
