import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './services/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  {
    path: 'signin',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/signin').then(m => m.SignInComponent)
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },

  {
    path: 'athletes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/athletes/athletes').then(m => m.AthletesComponent)
  },

  {
    path: 'nutrition',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/nutrition/nutrition').then(m => m.NutritionComponent)
  },

  {
    path: 'consultations',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/consultations/consultations').then(m => m.ConsultationsComponent)
  },

  {
    path: 'coaches',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/coaches/coaches').then(m => m.CoachesComponent)
  },

  { path: '**', redirectTo: 'signin' }
];