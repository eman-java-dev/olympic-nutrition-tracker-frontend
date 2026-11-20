import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage';
import { ApiService, ListPage, singlePage } from './api';
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

@Injectable({ providedIn: 'root' })
export class AthleteService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'athletes';
  private useApi = environment.useApi;

  listPage(page: number): Promise<ListPage<Athlete>> {
    return this.useApi
      ? this.api.getPage<Athlete>('/athletes', page)
      : Promise.resolve(singlePage(this.store.read<Athlete>(this.key)));
  }

  listAll(): Promise<Athlete[]> {
    return this.useApi
      ? this.api.getAllPages<Athlete>('/athletes')
      : Promise.resolve(this.store.read<Athlete>(this.key));
  }

  async create(a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const payload: Athlete = {
        name: a.name,
        age: a.age,
        gender: a.gender,
        weight: a.weight,
        height: a.height
      };

      return this.api.post<Athlete>('/athletes', payload);
    }

    return this.store.upsert<Athlete>(this.key, a);
  }

  async update(id: number, a: Athlete): Promise<Athlete> {
    if (this.useApi) {
      const payload: Athlete = {
        name: a.name,
        age: a.age,
        gender: a.gender,
        weight: a.weight,
        height: a.height
      };

      return this.api.put<Athlete>(`/athletes/${id}`, payload);
    }

    const updated: Athlete = { ...a, id };
    return this.store.upsert<Athlete>(this.key, updated);
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/athletes/${id}`);

      return;
    }

    this.store.remove(this.key, id);
  }
}