import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NutritionService } from '../../services/nutrition';
import type { NutritionEntry } from '../../services/nutrition-entry';
import { LangService } from '../../services/lang';

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

@Component({
  standalone: true,
  selector: 'app-nutrition',
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.css',
})
export class NutritionComponent implements OnInit {
  private service = inject(NutritionService);
  private i18n = inject(LangService);
  t = (k: string) => this.i18n.t(k);

  list = signal<NutritionEntry[]>([]);
  editingId = signal<number | null>(null);

  model: NutritionEntry = {
    date: todayStr(),
    calories: 0, protein: 0, carbs: 0, fat: 0, notes: '',
  };

  async ngOnInit() {
    const data = await this.service.list();
    this.list.set(Array.isArray(data) ? (data as NutritionEntry[]) : []);
  }

  async save(f: NgForm) {
    const id = this.editingId();
    if (id) await this.service.update(id, this.model);
    else    await this.service.create(this.model);

    this.resetForm(f);
    this.list.set(await this.service.list());
  }

  edit(e: NutritionEntry) {
    this.editingId.set(e.id ?? null);
    this.model = { ...e };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(id: number) {
    if (!confirm('Delete entry?')) return;
    await this.service.remove(id);
    this.list.set((this.list() || []).filter(x => x.id !== id));
  }

  resetForm(f: NgForm) {
    this.editingId.set(null);
    f.resetForm();
    this.model = { date: todayStr(), calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' };
  }

  get totalCalories(): number {
    const L = this.list() || [];
    return L.reduce((s, e) => s + (Number(e.calories) || 0), 0);
  }

  get totals(): { p: number; c: number; f: number } {
    const L = this.list() || [];
    return {
      p: L.reduce((s, e) => s + (Number(e.protein) || 0), 0),
      c: L.reduce((s, e) => s + (Number(e.carbs) || 0), 0),
      f: L.reduce((s, e) => s + (Number(e.fat) || 0), 0),
    };
  }
}
