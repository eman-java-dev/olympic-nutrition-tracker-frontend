import { Injectable } from '@angular/core';
let uid = Date.now();
function nextId(){ return ++uid; }
@Injectable({ providedIn: 'root' })
export class StorageService {
  read<T>(key: string): T[] { const raw = localStorage.getItem(key); if(!raw) return []; try{return JSON.parse(raw) as T[];}catch{return[];} }
  write<T>(key: string, data: T[]): void { localStorage.setItem(key, JSON.stringify(data)); }
  upsert<T extends {id?: number}>(key: string, item: T): T {
    const list = this.read<T & {id:number}>(key);
    if(!item.id){ const created = { ...(item as any), id: nextId() } as T & {id:number}; list.unshift(created); this.write(key, list as unknown as T[]); return created as T; }
    const idx = list.findIndex(x=>x.id===item.id); if(idx>=0){ (list[idx] as any) = { ...(list[idx] as any), ...(item as any) }; }
    this.write(key, list as unknown as T[]); return item as T;
  }
  remove(key: string, id: number): void { const list = this.read<any>(key).filter((x:any)=>x.id!==id); this.write(key, list); }
}
