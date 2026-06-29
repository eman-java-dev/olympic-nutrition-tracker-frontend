import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NutritionService } from '../../services/nutrition';
import type { NutritionEntry } from '../../services/nutrition-entry';
import { Athlete, AthleteService } from '../../services/athlete';
import { LangService } from '../../services/lang';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  standalone: true,
  selector: 'app-nutrition',
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.css',
})
export class NutritionComponent implements OnInit {
  private service = inject(NutritionService);
  private athleteService = inject(AthleteService);
  private i18n = inject(LangService);

  t = (k: string) => this.i18n.t(k);

  list = signal<NutritionEntry[]>([]);
  athletes = signal<Athlete[]>([]);
  editingId = signal<number | null>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');

  model: NutritionEntry = {
    date: todayStr(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: '',
    athleteId: undefined
  };

  async ngOnInit(): Promise<void> {
    await this.loadPageData();
  }

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');

      await this.athleteService.init();
      this.athletes.set(this.athleteService.list());

      const data = await this.service.list();
      this.list.set(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      this.error.set('Impossible de charger les données. Vérifiez que le backend est démarré.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(f: NgForm): Promise<void> {
    if (!this.model.athleteId) {
      this.error.set('Veuillez sélectionner un athlète.');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set('');

      const id = this.editingId();

      const payload: NutritionEntry = {
        date: this.model.date,
        calories: Number(this.model.calories) || 0,
        protein: Number(this.model.protein) || 0,
        carbs: Number(this.model.carbs) || 0,
        fat: Number(this.model.fat) || 0,
        notes: this.model.notes || '',
        athleteId: Number(this.model.athleteId)
      };

      if (id) {
        await this.service.update(id, payload);
      } else {
        await this.service.create(payload);
      }

      await this.reloadAndReset(f);
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de l’enregistrement. Vérifiez les données et le backend.');
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(e: NutritionEntry): void {
    this.editingId.set(e.id ?? null);
    this.model = {
      id: e.id,
      date: e.date,
      calories: e.calories,
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat,
      notes: e.notes || '',
      athleteId: e.athleteId
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(id?: number): Promise<void> {
    if (!id) return;

    const msg = this.t('common.confirmDelete') || 'Supprimer cette entrée ?';
    if (!confirm(msg)) return;

    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.remove(id);
      this.list.set((this.list() || []).filter(x => x.id !== id));

      if (this.editingId() === id) {
        this.editingId.set(null);
      }
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de la suppression.');
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(f: NgForm): void {
    this.editingId.set(null);
    f.resetForm();

    this.model = {
      date: todayStr(),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      notes: '',
      athleteId: undefined
    };
  }

  private async reloadAndReset(f: NgForm): Promise<void> {
    this.resetForm(f);
    await this.loadPageData();
  }

  get totalCalories(): number {
    return (this.list() || []).reduce((s, e) => s + (Number(e.calories) || 0), 0);
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