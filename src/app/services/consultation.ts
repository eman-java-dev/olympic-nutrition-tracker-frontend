import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage';
import { ApiService, ListPage, singlePage } from './api';
import { environment } from '../../environments/environment';

export interface Consultation {
  id?: number;
  message: string;
  scheduledAt: string;
  athleteId?: number;
  coachId?: number;
  athleteName?: string;
  coachName?: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'consultations';
  private useApi = environment.useApi;

  listPage(page: number): Promise<ListPage<Consultation>> {
    return this.useApi
      ? this.api.getPage<Consultation>('/consultations', page)
      : Promise.resolve(singlePage(this.store.read<Consultation>(this.key)));
  }

  async create(c: Consultation): Promise<Consultation> {
    if (this.useApi) {
      return this.api.post<Consultation>('/consultations', c);
    }

    return this.store.upsert<Consultation>(this.key, c);
  }

  async update(id: number, c: Consultation): Promise<Consultation> {
    if (this.useApi) {
      return this.api.put<Consultation>(`/consultations/${id}`, c);
    }

    const updated: Consultation = { ...c, id };
    return this.store.upsert<Consultation>(this.key, updated);
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/consultations/${id}`);

      return;
    }

    this.store.remove(this.key, id);
  }
}