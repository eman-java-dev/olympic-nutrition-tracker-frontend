import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LangService } from '../../services/lang';
import { Athlete, AthleteService } from '../../services/athlete';

@Component({
  standalone: true,
  selector: 'app-athletes',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './athletes.html',
  styleUrl: './athletes.css'
})
export class AthletesComponent implements OnInit {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);

  private service = inject(AthleteService);
  year = new Date().getFullYear();

  loading = signal(false);
  error = signal<string|null>(null);
  list = signal<Athlete[]>([]);
  editingId = signal<number|null>(null);

  model: Athlete = { name: '' };

  async ngOnInit(){ await this.fetch(); }
  async fetch(){ this.loading.set(true); this.error.set(null);
    try { this.list.set(await this.service.list()); } catch { this.error.set('Load failed'); }
    this.loading.set(false);
  }
  async create(form: NgForm){
    if(!this.model.name?.trim()) return;
    this.loading.set(true);
    try {
      const a = await this.service.create(this.model);
      this.list.set([a, ...this.list()]);
      form.resetForm(); this.model = { name: '' };
    } catch { this.error.set('Create failed'); }
    this.loading.set(false);
  }
  startEdit(a: Athlete){ this.editingId.set(a.id!); this.model = { ...a }; window.scrollTo({top:0, behavior:'smooth'}); }
  cancelEdit(form: NgForm){ this.editingId.set(null); form.resetForm(); this.model = { name: '' }; }
  async update(form: NgForm){
    const id = this.editingId(); if(!id) return;
    this.loading.set(true);
    try {
      const a = await this.service.update(id, this.model);
      this.list.set(this.list().map(x => x.id===id ? a : x));
      this.cancelEdit(form);
    } catch { this.error.set('Update failed'); }
    this.loading.set(false);
  }
  async remove(id:number){
    if(!confirm('Delete this athlete?')) return;
    this.loading.set(true);
    try { await this.service.remove(id); this.list.set(this.list().filter(x=>x.id!==id)); }
    catch { this.error.set('Delete failed'); }
    this.loading.set(false);
  }
}
