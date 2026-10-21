import { Routes } from '@angular/router';
import { dashboardEntryGuard, startupGuard } from '@core/auth/auth.guard';

export const user_routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [dashboardEntryGuard],
    loadComponent: () => import('./home/home').then((module) => module.Home),
  },
  {
    path: 'startup',
    canActivate: [startupGuard],
    loadComponent: () =>
      import('../startup/startup').then((module) => module.Startup),
  },
];
