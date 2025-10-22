import { Routes } from '@angular/router';
import { AthletesComponent } from './pages/athletes/athletes';
import { NutritionComponent } from './pages/nutrition/nutrition';

export const routes: Routes = [
  { path: '', redirectTo: 'athletes', pathMatch: 'full' },
  { path: 'athletes', component: AthletesComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: '**', redirectTo: 'athletes' }
];
