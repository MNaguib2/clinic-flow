import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  return store.initialize().pipe(
    map((isAuthenticated) => {
      const currentUrl = route.routeConfig?.path ?? '';

      if (currentUrl === 'login') {
        return isAuthenticated ? router.createUrlTree(['/dashboard']) : true;
      }

      return isAuthenticated ? true : router.createUrlTree(['/login']);
    }),
  );
};

export const dashboardEntryGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  console.log("🚀 ~ dashboardEntryGuard ~ store.startup():", store.startup())
  return store.startup() ? router.createUrlTree(['/dashboard/startup']) : true;
};

export const startupGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  return store.startup() ? true : router.createUrlTree(['/dashboard']);
};
