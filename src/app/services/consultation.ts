import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage';
import { ApiService } from './api';
import { environment } from '../../environments/environment';

export interface Consultation {
  id?: number;
  date: string;
  notes?: string;
  athleteId?: number;
  coachId?: number;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private store = inject(StorageService);
  private api = inject(ApiService);
  private key = 'consultations';
  private useApi = environment.useApi;

  list = signal<Consultation[]>([]);

  async init() { this.list.set(await this.listAll()); }

  async listAll(): Promise<Consultation[]> {
    if (this.useApi) return await this.api.get<Consultation[]>('/consultations');
    return this.store.read<Consultation>(this.key);
  }

  async create(c: Consultation): Promise<Consultation> {
    if (this.useApi) {
      const saved = await this.api.post<Consultation>('/consultations', c);
      this.list.set([...(this.list() || []), saved]);
      return saved;
    }
    const saved = this.store.upsert<Consultation>(this.key, c);
    this.list.set(this.store.read<Consultation>(this.key));
    return saved;
  }

  async update(id: number, c: Consultation): Promise<Consultation> {
    if (this.useApi) {
      const saved = await this.api.put<Consultation>(`/consultations/${id}`, c);
      this.list.set((this.list() || []).map(x => x.id === id ? saved : x));
      return saved;
    }
    c.id = id;
    const saved = this.store.upsert<Consultation>(this.key, c);
    this.list.set(this.store.read<Consultation>(this.key));
    return saved;
  }

  async remove(id: number): Promise<void> {
    if (this.useApi) {
      await this.api.delete<void>(`/consultations/${id}`);
      this.list.set((this.list() || []).filter(x => x.id !== id));
      return;
    }
    this.store.remove(this.key, id);
    this.list.set(this.store.read<Consultation>(this.key));
  }
}
