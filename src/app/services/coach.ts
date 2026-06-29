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

interface PageResponse<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class CoachService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'coaches';
  private useApi = environment.useApi;

  list = signal<Coach[]>([]);

  async init(): Promise<void> {
    this.list.set(await this.listAll());
  }

  async listAll(): Promise<Coach[]> {
    if (this.useApi) {
      const response = await this.api.get<Coach[] | PageResponse<Coach>>('/coaches');

      if (Array.isArray(response)) {
        return response;
      }

      return Array.isArray(response.content) ? response.content : [];
    }

    return this.store.read<Coach>(this.key);
  }

  async create(c: Coach): Promise<Coach> {
    if (this.useApi) {
      const payload: Coach = {
        name: c.name,
        specialty: c.specialty || '',
        email: c.email || '',
        phone: c.phone || ''
      };

      const saved = await this.api.post<Coach>('/coaches', payload);

      await this.init();

      return saved;
    }

    const saved = this.store.upsert<Coach>(this.key, c);
    this.list.set(this.store.read<Coach>(this.key));
    return saved;
  }

  async update(id: number, c: Coach): Promise<Coach> {
    if (this.useApi) {
      const payload: Coach = {
        name: c.name,
        specialty: c.specialty || '',
        email: c.email || '',
        phone: c.phone || ''
      };

      const saved = await this.api.put<Coach>(`/coaches/${id}`, payload);

      await this.init();

      return saved;
    }

    const updated: Coach = { ...c, id };
    const saved = this.store.upsert<Coach>(this.key, updated);
    this.list.set(this.store.read<Coach>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/coaches/${id}`);

      await this.init();

      return;
    }

    this.store.remove(this.key, id);
    this.list.set(this.store.read<Coach>(this.key));
  }
}