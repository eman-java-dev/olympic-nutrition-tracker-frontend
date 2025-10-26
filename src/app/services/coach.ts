import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
export interface Coach { id?: number; name: string; specialty?: string; email?: string; phone?: string; }
@Injectable({ providedIn: 'root' })
export class CoachService {
  private store = inject(StorageService); private key='coaches';
  list(): Promise<Coach[]> { return Promise.resolve(this.store.read<Coach>(this.key)); }
  create(c: Coach): Promise<Coach> { return Promise.resolve(this.store.upsert<Coach>(this.key, c)); }
  update(id:number, c:Coach): Promise<Coach> { return Promise.resolve(this.store.upsert<Coach>(this.key, {...c,id})); }
  remove(id:number): Promise<void> { this.store.remove(this.key,id); return Promise.resolve(); }
}
