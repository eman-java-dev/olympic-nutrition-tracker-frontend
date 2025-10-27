import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'athletes', loadComponent: () => import('./pages/athletes/athletes').then(m => m.AthletesComponent) },
  { path: 'nutrition', loadComponent: () => import('./pages/nutrition/nutrition').then(m => m.NutritionComponent) },
  { path: 'consultations', loadComponent: () => import('./pages/consultations/consultations').then(m => m.ConsultationsComponent) },
  { path: 'coaches', loadComponent: () => import('./pages/coaches/coaches').then(m => m.CoachesComponent) },

  //  صفحة تسجيل الدخول
  { path: 'signin', loadComponent: () => import('./pages/auth/signin').then(m => m.SignInComponent) },
  { path: '**', redirectTo: '' }
];
