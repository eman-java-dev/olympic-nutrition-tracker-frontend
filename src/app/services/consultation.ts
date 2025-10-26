import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';

export interface Consultation {
  id?: number;
  name: string;
  date: string;   // ISO
  note?: string;
}
@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private store = inject(StorageService);
  private key = 'consultations';
  list(): Promise<Consultation[]> { return Promise.resolve(this.store.read<Consultation>(this.key)); }
  create(b: Consultation): Promise<Consultation> { return Promise.resolve(this.store.upsert<Consultation>(this.key, b)); }
  update(id:number, b: Consultation): Promise<Consultation> { return Promise.resolve(this.store.upsert<Consultation>(this.key, {...b, id})); }
  remove(id:number): Promise<void> { this.store.remove(this.key,id); return Promise.resolve(); }
}
