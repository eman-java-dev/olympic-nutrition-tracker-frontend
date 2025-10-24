import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AthletesComponent } from './pages/athletes/athletes';
import { ConsultationsComponent } from './pages/consultations/consultations';
import { CoachesComponent } from './pages/coaches/coaches';
import { NutritionComponent } from './pages/nutrition/nutrition';

export const routes: Routes = [
  { path: '', component: HomeComponent },                // صفحة البداية
  { path: 'athletes', component: AthletesComponent },
  { path: 'consultations', component: ConsultationsComponent },
  { path: 'coaches', component: CoachesComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: '**', redirectTo: '' }
];
