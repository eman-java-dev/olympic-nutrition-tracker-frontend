import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type Priority = 'LOW'|'MEDIUM'|'HIGH';

export interface ConsultationCreate {
  athleteId: number;
  topic: string;
  message: string;
  priority: Priority;
}

export interface Consultation extends ConsultationCreate {
  id: number;
  status?: 'PENDING'|'APPROVED'|'REJECTED';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private base = `${environment.apiUrl}/consultations`;

  private async jsonFetch<T>(u: string, init?: RequestInit): Promise<T> {
    const r = await fetch(u, { headers: { 'Content-Type': 'application/json' }, ...init });
    if (!r.ok) throw new Error(await r.text().catch(()=> 'request_failed'));
    return r.json() as Promise<T>;
  }

  async list(): Promise<Consultation[]> {
    const raw = await this.jsonFetch<any>(this.base);
    if (raw && Array.isArray(raw.content)) return raw.content as Consultation[];
    return Array.isArray(raw) ? raw as Consultation[] : [];
  }

  async create(dto: ConsultationCreate): Promise<Consultation> {
    return this.jsonFetch<Consultation>(this.base, { method:'POST', body: JSON.stringify(dto) });
  }

  async remove(id: number): Promise<void> {
    await this.jsonFetch<void>(`${this.base}/${id}`, { method: 'DELETE' });
  }
}
