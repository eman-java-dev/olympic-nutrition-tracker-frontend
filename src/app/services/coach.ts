import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Coach {
  id?: number;
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CoachService {
  private base = `${environment.apiUrl}/coaches`;

  private async jsonFetch<T>(u: string, i?: RequestInit): Promise<T> {
    const r = await fetch(u, { headers: { 'Content-Type':'application/json' }, ...i });
    if (!r.ok) throw new Error(await r.text().catch(()=> 'request_failed'));
    return r.json() as Promise<T>;
  }

  async list(): Promise<Coach[]> {
    const raw = await this.jsonFetch<any>(this.base);
    if (raw && Array.isArray(raw.content)) return raw.content;
    return Array.isArray(raw) ? raw : [];
  }

  async create(dto: Coach): Promise<Coach> {
    return this.jsonFetch<Coach>(this.base, { method:'POST', body: JSON.stringify(dto) });
  }

  async remove(id: number): Promise<void> {
    await this.jsonFetch<void>(`${this.base}/${id}`, { method:'DELETE' });
  }
}
