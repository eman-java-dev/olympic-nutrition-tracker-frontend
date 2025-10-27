import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';

export interface Athlete {
  id?: number;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
}

@Injectable({ providedIn: 'root' })
export class AthleteService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'athletes';
  private useApi = environment.useApi;

  list = signal<Athlete[]>([]);

  async init() { this.list.set(await this.listAll()); }

  async listAll(): Promise<Athlete[]> {
    if (this.useApi) return await this.api.get<Athlete[]>('/athletes');
    return this.store.read<Athlete>(this.key);
  }

  async create(a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const saved = await this.api.post<Athlete>('/athletes', a);
      this.list.set([...(this.list() || []), saved]);
      return saved;
    }
    const saved = this.store.upsert<Athlete>(this.key, a);
    this.list.set(this.store.read<Athlete>(this.key));
    return saved;
  }

  async update(id: number, a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const saved = await this.api.put<Athlete>(`/athletes/${id}`, a);
      this.list.set((this.list() || []).map(x => x.id === id ? saved : x));
      return saved;
    }
    a.id = id;
    const saved = this.store.upsert<Athlete>(this.key, a);
    this.list.set(this.store.read<Athlete>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/athletes/${id}`);
      this.list.set((this.list() || []).filter(x => x.id !== id));
      return;
    }
    this.store.remove(this.key, id);
    this.list.set(this.store.read<Athlete>(this.key));
  }
}
