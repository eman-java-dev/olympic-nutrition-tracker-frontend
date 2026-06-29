import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';

export interface Athlete {
  id?: number;
  name: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  bmi?: number;
}

interface PageResponse<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class AthleteService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'athletes';
  private useApi = environment.useApi;

  list = signal<Athlete[]>([]);

  async init(): Promise<void> {
    this.list.set(await this.listAll());
  }

  async listAll(): Promise<Athlete[]> {
    if (this.useApi) {
      const response = await this.api.get<Athlete[] | PageResponse<Athlete>>('/athletes');

      if (Array.isArray(response)) {
        return response;
      }

      return Array.isArray(response.content) ? response.content : [];
    }

    return this.store.read<Athlete>(this.key);
  }

  async create(a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const payload: Athlete = {
        name: a.name,
        age: a.age,
        gender: a.gender || '',
        weight: a.weight,
        height: a.height
      };

      const saved = await this.api.post<Athlete>('/athletes', payload);

      await this.init();

      return saved;
    }

    const saved = this.store.upsert<Athlete>(this.key, a);
    this.list.set(this.store.read<Athlete>(this.key));
    return saved;
  }

  async update(id: number, a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const payload: Athlete = {
        name: a.name,
        age: a.age,
        gender: a.gender || '',
        weight: a.weight,
        height: a.height
      };

      const saved = await this.api.put<Athlete>(`/athletes/${id}`, payload);

      await this.init();

      return saved;
    }

    const updated: Athlete = { ...a, id };
    const saved = this.store.upsert<Athlete>(this.key, updated);
    this.list.set(this.store.read<Athlete>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/athletes/${id}`);

      await this.init();

      return;
    }

    this.store.remove(this.key, id);
    this.list.set(this.store.read<Athlete>(this.key));
  }
}