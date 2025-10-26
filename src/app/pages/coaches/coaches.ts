import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Coach, CoachService } from '../../services/coach';
import { LangService } from '../../services/lang';

@Component({
  standalone: true,
  selector: 'app-coaches',
  imports: [CommonModule, FormsModule],
  templateUrl: './coaches.html',
})
export class CoachesComponent implements OnInit {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);

  private service = inject(CoachService);
  list = signal<Coach[]>([]);
  editingId = signal<number|null>(null);
  model: Coach = { name:'', specialty:'', email:'', phone:'' };

  async ngOnInit(){ this.list.set(await this.service.list()); }

  async save(f:NgForm){
    if(this.editingId()){
      const c = await this.service.update(this.editingId()!, this.model);
      this.list.set(this.list().map(x=>x.id===c.id?c:x));
    } else {
      const c = await this.service.create(this.model);
      this.list.set([c, ...this.list()]);
    }
    this.cancel(f);
  }

  edit(c:Coach){ this.editingId.set(c.id!); this.model = { ...c }; window.scrollTo({top:0,behavior:'smooth'}); }
  cancel(f:NgForm){ this.editingId.set(null); f.resetForm(); this.model = { name:'', specialty:'', email:'', phone:'' }; }
  async remove(id:number){ if(!confirm('Delete this coach?')) return; await this.service.remove(id); this.list.set(this.list().filter(x=>x.id!==id)); }
}
