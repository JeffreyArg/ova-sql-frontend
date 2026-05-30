import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'exercise',
    loadComponent: () =>
      import('./pages/exercise/exercise.component').then(m => m.ExerciseComponent),
  },
  { path: '**', redirectTo: '' },
];
