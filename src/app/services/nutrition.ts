import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';
import type { NutritionEntry } from './nutrition-entry';

interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'nutrition_entries';
  private useApi = environment.useApi;

  async list(): Promise<NutritionEntry[]> {
    if (this.useApi) {
      const page = await this.api.get<PageResponse<NutritionEntry>>('/nutrition-entries');
      return Array.isArray(page.content) ? page.content : [];
    }

    const data = this.store.read<NutritionEntry>(this.key);
    return Array.isArray(data) ? data : [];
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