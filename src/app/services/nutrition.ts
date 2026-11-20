import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { ApiService, ListPage, singlePage } from './api';
import { environment } from '../../environments/environment';
import type { NutritionEntry } from './nutrition-entry';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'nutrition_entries';
  private useApi = environment.useApi;

  listPage(page: number): Promise<ListPage<NutritionEntry>> {
    return this.useApi
      ? this.api.getPage<NutritionEntry>('/nutrition-entries', page)
      : Promise.resolve(singlePage(this.store.read<NutritionEntry>(this.key)));
  }

  async create(e: NutritionEntry): Promise<NutritionEntry> {
    if (this.useApi) {
      return await this.api.post<NutritionEntry>('/nutrition-entries', e);
    }

    return this.store.upsert<NutritionEntry>(this.key, e);
  }

  async update(id: number, e: NutritionEntry): Promise<NutritionEntry> {
    if (this.useApi) {
      return await this.api.put<NutritionEntry>(`/nutrition-entries/${id}`, e);
    }

    return this.store.upsert<NutritionEntry>(this.key, { ...e, id });
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/nutrition-entries/${id}`);
      return;
    }

    this.store.remove(this.key, id);
  }
}

export type { NutritionEntry } from './nutrition-entry';