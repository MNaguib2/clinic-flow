import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { currentUserResolver } from './core/auth/current-user.resolver';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login-page').then((module) => module.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register-page').then((module) => module.RegisterPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-shell').then((module) => module.DashboardShell),
    canActivate: [authGuard],
    resolve: { currentUser: currentUserResolver },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home').then((module) => module.DashboardHome),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
