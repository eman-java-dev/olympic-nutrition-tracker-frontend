import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Athlete, AthleteService } from '../../services/athlete';
import { LangService } from '../../services/lang'; // ✅ إضافة خدمة الترجمة

@Component({
  standalone: true,
  selector: 'app-athletes',
  imports: [FormsModule],
  templateUrl: './athletes.html',
  styleUrl: './athletes.css'
})
export class AthletesComponent implements OnInit {

  private service = inject(AthleteService);
  private i18n = inject(LangService);     // ✅ إضافة الترجمة
  t = (k: string) => this.i18n.t(k);      // ✅ دالة الترجمة داخل HTML

  // القائمة
  list = () => this.service.list();

  // نموذج الإدخال
  model: Athlete = { name: '', age: undefined, weight: undefined, height: undefined };

  // المعرف الجاري تعديله
  editingId = signal<number | undefined>(undefined);

  async ngOnInit() {
    await this.service.init();
  }

  startEdit(a: Athlete) {
    this.editingId.set(a.id);
    this.model = { ...a };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async create(f: NgForm) {
    if (!this.model.name?.trim()) return;
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
    if (!confirm(this.t('common.confirmDelete') || 'Supprimer ?')) return;
    await this.service.remove(id);
    if (this.editingId() === id) this.editingId.set(undefined);
  }

  resetForm(f: NgForm) {
    f.resetForm();
    this.model = { name: '', age: undefined, weight: undefined, height: undefined };
    this.editingId.set(undefined);
  }
}
