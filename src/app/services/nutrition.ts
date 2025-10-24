import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionEntryUI {
  id?: number;
  athleteId: number;
  mealType: Meal;
  caloriesKcal?: number | null;
  proteinsG?: number | null;
  carbsG?: number | null;
  fatsG?: number | null;
  loggedAt?: string | null; // ISO
}

// BAC
type NutritionEntryAPI = {
  id?: number;
  athleteId: number;
  mealType: string;            // أو meal
  calories?: number | null;    // بديل لـ caloriesKcal
  caloriesKcal?: number | null;
  proteins?: number | null;    // بديل لـ proteinsG
  proteinsG?: number | null;
  carbs?: number | null;       // بديل لـ carbsG
  carbsG?: number | null;
  fats?: number | null;        // بديل لـ fatsG
  fatsG?: number | null;
  loggedAt?: string | null;    // أو createdAt
  createdAt?: string | null;
};

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private base = environment.apiUrl;

  private async jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  private toUI(x: NutritionEntryAPI): NutritionEntryUI {
    return {
      id: x.id,
      athleteId: x.athleteId,
      mealType: (x.mealType as Meal) ?? 'breakfast',
      caloriesKcal: (x.caloriesKcal ?? x.calories) ?? null,
      proteinsG: (x.proteinsG ?? x.proteins) ?? null,
      carbsG: (x.carbsG ?? x.carbs) ?? null,
      fatsG: (x.fatsG ?? x.fats) ?? null,
      loggedAt: x.loggedAt ?? x.createdAt ?? null
    };
  }

  private toAPI(x: NutritionEntryUI): NutritionEntryAPI {
    return {
      athleteId: x.athleteId,
      mealType: x.mealType,
      caloriesKcal: x.caloriesKcal ?? null,
      proteinsG: x.proteinsG ?? null,
      carbsG: x.carbsG ?? null,
      fatsG: x.fatsG ?? null,
      loggedAt: x.loggedAt ?? null
    };
  }

  /** GET /athletes/{id}/nutrition */
  async listByAthlete(athleteId: number): Promise<NutritionEntryUI[]> {
    const raw = await this.jsonFetch<any>(`${this.base}/athletes/${athleteId}/nutrition`);
    if (raw && Array.isArray(raw.content)) return raw.content.map((r: NutritionEntryAPI) => this.toUI(r));
    if (Array.isArray(raw)) return raw.map((r: NutritionEntryAPI) => this.toUI(r));
    return [];
  }

  /** POST /athletes/{id}/nutrition */
  async create(athleteId: number, entry: NutritionEntryUI): Promise<NutritionEntryUI> {
    const created = await this.jsonFetch<NutritionEntryAPI>(
      `${this.base}/athletes/${athleteId}/nutrition`,
      { method: 'POST', body: JSON.stringify(this.toAPI(entry)) }
    );
    return this.toUI(created);
  }

  /** DELETE /nutrition/{id} */
  async remove(entryId: number): Promise<void> {
    await this.jsonFetch<void>(`${this.base}/nutrition/${entryId}`, { method: 'DELETE' });
  }
}
