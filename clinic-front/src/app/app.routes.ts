import { Routes } from '@angular/router';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-page').then((module) => module.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/register/register-page').then((module) => module.RegisterPage),
  },
  { path: '**', redirectTo: '' },
];
