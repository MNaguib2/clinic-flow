import { Routes } from '@angular/router';

export const user_routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((module) => module.Home),
  },
];
