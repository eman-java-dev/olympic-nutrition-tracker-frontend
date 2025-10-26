import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Consultation, ConsultationService } from '../../services/consultation';
import { LangService } from '../../services/lang';

@Component({
  standalone: true,
  selector: 'app-consultations',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultations.html',
  styleUrl: './consultations.css'
})
export class ConsultationsComponent {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);

  private store = inject(ConsultationService);
  list = signal<Consultation[]>([]);
  model: Consultation = { name: '', date: new Date().toISOString().slice(0,16) };

  async ngOnInit(){ this.list.set(await this.store.list()); }

  async save(f: NgForm){
    if(this.model.id){ const upd = await this.store.update(this.model.id, this.model); this.list.set(this.list().map(x=>x.id===upd.id?upd:x)); }
    else { const c = await this.store.create(this.model); this.list.set([c, ...this.list()]); }
    f.resetForm(); this.model = { name: '', date: new Date().toISOString().slice(0,16) };
  }

  edit(c: Consultation){ this.model = { ...c }; }
  async remove(id:number){ if(confirm('Delete booking?')){ await this.store.remove(id); this.list.set(this.list().filter(x=>x.id!==id)); } }
}
