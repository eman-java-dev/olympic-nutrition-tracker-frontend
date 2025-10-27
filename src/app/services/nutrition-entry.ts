import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';

export interface NutritionEntry {
  id?: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class NutritionEntryService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'nutrition';
  private useApi = environment.useApi;

  list = signal<NutritionEntry[]>([]);

  async init() { this.list.set(await this.listAll()); }

  async listAll(): Promise<NutritionEntry[]> {
    if (this.useApi) return await this.api.get<NutritionEntry[]>('/nutrition');
    return this.store.read<NutritionEntry>(this.key);
  }

  async create(e: NutritionEntry): Promise<NutritionEntry> {
    if (this.useApi) {
      const saved = await this.api.post<NutritionEntry>('/nutrition', e);
      this.list.set([...(this.list() || []), saved]);
      return saved;
    }
    const saved = this.store.upsert<NutritionEntry>(this.key, e);
    this.list.set(this.store.read<NutritionEntry>(this.key));
    return saved;
  }

  async update(id: number, e: NutritionEntry): Promise<NutritionEntry> {
    if (this.useApi) {
      const saved = await this.api.put<NutritionEntry>(`/nutrition/${id}`, e);
      this.list.set((this.list() || []).map(x => x.id === id ? saved : x));
      return saved;
    }
    e.id = id;
    const saved = this.store.upsert<NutritionEntry>(this.key, e);
    this.list.set(this.store.read<NutritionEntry>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/nutrition/${id}`);
      this.list.set((this.list() || []).filter(x => x.id !== id));
      return;
    }
    this.store.remove(this.key, id);
    this.list.set(this.store.read<NutritionEntry>(this.key));
  }
}
