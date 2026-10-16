import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { currentUserResolver } from './core/auth/current-user.resolver';
import { Home } from './features/home/home';
import { user_routes } from './features/user-dashboard/routes/routes';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [authGuard],
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
      import('./features/user-dashboard/dashboard-shell').then((module) => module.DashboardShell),
    canActivate: [authGuard],
    resolve: { currentUser: currentUserResolver },
    children: user_routes,
  },
  { path: '**', redirectTo: '' },
];
