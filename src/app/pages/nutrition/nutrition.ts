import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface NutritionEntry {
  id?: number;
  athleteId: number;
  mealType: Meal;
  caloriesKcal?: number;
  proteinsG?: number;
  carbsG?: number;
  fatsG?: number;
  loggedAt?: string;
}

const API_BASE = 'http://localhost:8080/api';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.html'
})
export class NutritionComponent {
  form: NutritionEntry = { athleteId: 1, mealType: 'breakfast' };
  list: NutritionEntry[] = [];
  loading = false;
  ok = '';
  err = '';

  constructor(private http: HttpClient) {}

  load(): void {
    if (!this.form.athleteId) { this.err = 'Athlete ID requis.'; return; }
    this.ok = ''; this.err = ''; this.loading = true;
    this.http.get<NutritionEntry[]>(
      `${API_BASE}/athletes/${this.form.athleteId}/nutrition`
    ).subscribe({
      next: (d: NutritionEntry[]) => { this.list = d; this.loading = false; },
      error: () => { this.err = 'Échec du chargement (API).'; this.loading = false; }
    });
  }

  add(): void {
    this.ok = ''; this.err = '';
    if (!this.form.athleteId) { this.err = 'Athlete ID requis.'; return; }
    if (!this.form.mealType) { this.err = 'Type de repas requis.'; return; }
    this.http.post<NutritionEntry>(
      `${API_BASE}/athletes/${this.form.athleteId}/nutrition`,
      this.form
    ).subscribe({
      next: () => { this.ok = 'Entrée nutritionnelle ajoutée.'; this.load(); },
      error: () => { this.err = 'Échec de création (API).'; }
    });
  }

  remove(id?: number): void {
    if (!id) return;
    this.http.delete(`${API_BASE}/nutrition/${id}`).subscribe({
      next: () => this.load(),
      error: () => { this.err = 'Échec de suppression.'; }
    });
  }
}
