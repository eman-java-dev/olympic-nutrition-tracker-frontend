import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import type { NutritionEntry } from './nutrition-entry';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private store = inject(StorageService);
  private key = 'nutrition_entries';

  list(): Promise<NutritionEntry[]> {
    const data = this.store.read<NutritionEntry>(this.key);
    return Promise.resolve(Array.isArray(data) ? data : []);
  }

  create(e: NutritionEntry): Promise<NutritionEntry> {
    const created = this.store.upsert<NutritionEntry>(this.key, e);
    return Promise.resolve(created as NutritionEntry);
  }

  update(id: number, e: NutritionEntry): Promise<NutritionEntry> {
    const updated = this.store.upsert<NutritionEntry>(this.key, { ...e, id });
    return Promise.resolve(updated as NutritionEntry);
  }

  remove(id: number): Promise<void> {
    this.store.remove(this.key, id);
    return Promise.resolve();
  }
}

export type { NutritionEntry } from './nutrition-entry';
