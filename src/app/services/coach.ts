import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';

export interface Coach {
  id?: number;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class CoachService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'coaches';
  private useApi = environment.useApi;

  list = signal<Coach[]>([]);

  async init() { this.list.set(await this.listAll()); }

  async listAll(): Promise<Coach[]> {
    if (this.useApi) return await this.api.get<Coach[]>('/coaches');
    return this.store.read<Coach>(this.key);
  }

  async create(c: Coach): Promise<Coach> {
    if (this.useApi) {
      const saved = await this.api.post<Coach>('/coaches', c);
      this.list.set([...(this.list() || []), saved]);
      return saved;
    }
    const saved = this.store.upsert<Coach>(this.key, c);
    this.list.set(this.store.read<Coach>(this.key));
    return saved;
  }

  async update(id: number, c: Coach): Promise<Coach> {
    if (this.useApi) {
      const saved = await this.api.put<Coach>(`/coaches/${id}`, c);
      this.list.set((this.list() || []).map(x => x.id === id ? saved : x));
      return saved;
    }
    c.id = id;
    const saved = this.store.upsert<Coach>(this.key, c);
    this.list.set(this.store.read<Coach>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/coaches/${id}`);
      this.list.set((this.list() || []).filter(x => x.id !== id));
      return;
    }
    this.store.remove(this.key, id);
    this.list.set(this.store.read<Coach>(this.key));
  }
}
