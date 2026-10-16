import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((module) => module.Home),
  },
];
