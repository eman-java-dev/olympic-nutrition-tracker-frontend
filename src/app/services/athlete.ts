import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
export interface Athlete { id?: number; name: string; age?: number; weightKg?: number; heightCm?: number; }
@Injectable({ providedIn: 'root' })
export class AthleteService {
  private store = inject(StorageService); private key='athletes';
  list(): Promise<Athlete[]> { return Promise.resolve(this.store.read<Athlete>(this.key)); }
  create(a: Athlete): Promise<Athlete> { return Promise.resolve(this.store.upsert<Athlete>(this.key, a)); }
  update(id:number, a:Athlete): Promise<Athlete> { return Promise.resolve(this.store.upsert<Athlete>(this.key, {...a,id})); }
  remove(id:number): Promise<void> { this.store.remove(this.key, id); return Promise.resolve(); }
}
