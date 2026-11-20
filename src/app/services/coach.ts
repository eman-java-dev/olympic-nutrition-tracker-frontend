import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage';
import { ApiService, ListPage, singlePage } from './api';
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

  listPage(page: number): Promise<ListPage<Coach>> {
    return this.useApi
      ? this.api.getPage<Coach>('/coaches', page)
      : Promise.resolve(singlePage(this.store.read<Coach>(this.key)));
  }

  listAll(): Promise<Coach[]> {
    return this.useApi
      ? this.api.getAllPages<Coach>('/coaches')
      : Promise.resolve(this.store.read<Coach>(this.key));
  }

  async create(c: Coach): Promise<Coach> {
    if (this.useApi) {
      const payload: Coach = {
        name: c.name,
        specialty: c.specialty || '',
        email: c.email || '',
        phone: c.phone || ''
      };

      return this.api.post<Coach>('/coaches', payload);
    }

    return this.store.upsert<Coach>(this.key, c);
  }

  async update(id: number, c: Coach): Promise<Coach> {
    if (this.useApi) {
      const payload: Coach = {
        name: c.name,
        specialty: c.specialty || '',
        email: c.email || '',
        phone: c.phone || ''
      };

      return this.api.put<Coach>(`/coaches/${id}`, payload);
    }

    const updated: Coach = { ...c, id };
    return this.store.upsert<Coach>(this.key, updated);
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/coaches/${id}`);

      return;
    }

    this.store.remove(this.key, id);
  }
}