import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Consultation, ConsultationService } from '../../services/consultation';
import { LangService } from '../../services/lang';

@Component({
  standalone: true,
  selector: 'app-consultations',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultations.html',
  styleUrl: './consultations.css'
})
export class ConsultationsComponent implements OnInit {
  private service = inject(ConsultationService);
  private lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);

  list = () => this.service.list();

  // ✅ نستخدم الحقول الصحيحة الموجودة في Consultation: date, notes, athleteId, coachId
  model: Consultation = {
    date: new Date().toISOString().slice(0,16),
    notes: '',
    athleteId: undefined,
    coachId: undefined
  };

  editingId = signal<number|undefined>(undefined);

  async ngOnInit() {
    await this.service.init();
  }

  startEdit(c: Consultation) {
    this.editingId.set(c.id);
    this.model = { ...c };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async create(f: NgForm) {
    await this.service.create({ ...this.model });
    this.resetForm(f);
  }

  async update(f: NgForm) {
    const id = this.editingId();
    if (!id) return;
    await this.service.update(id, { ...this.model });
    this.resetForm(f);
  }

  async remove(id: number) {
    if (!confirm('Supprimer ?')) return;
    await this.service.remove(id);
    if (this.editingId() === id) this.editingId.set(undefined);
  }

  resetForm(f: NgForm) {
    f.resetForm();
    this.model = {
      date: new Date().toISOString().slice(0,16),
      notes: '',
      athleteId: undefined,
      coachId: undefined
    };
    this.editingId.set(undefined);
  }
}
