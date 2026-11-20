import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NutritionService } from '../../services/nutrition';
import type { NutritionEntry } from '../../services/nutrition-entry';
import { Athlete, AthleteService } from '../../services/athlete';
import { apiErrorKey, ListPage } from '../../services/api';
import { AuthService } from '../../services/auth';
import { LangService } from '../../services/lang';
import { ListPagerComponent } from '../list-pager';
import { localDateTime } from '../local-date';

@Component({
  standalone: true,
  selector: 'app-nutrition',
  imports: [CommonModule, FormsModule, ListPagerComponent],
  templateUrl: './nutrition.html',
  styleUrl: './nutrition.css'
})
export class NutritionComponent implements OnInit {
  private service = inject(NutritionService);
  private athleteService = inject(AthleteService);
  private auth = inject(AuthService);
  private lang = inject(LangService);

  t = (key: string) => this.lang.t(key);
  language = this.lang.lang;

  page = signal<ListPage<NutritionEntry> | null>(null);
  list = () => this.page()?.items ?? [];
  editingId = signal<number | undefined>(undefined);
  loading = signal(false);
  error = signal('');
  listError = signal('');
  success = signal('');
  athletes = signal<Athlete[]>([]);
  optionsLoading = signal(false);
  lookupError = signal('');

  model = this.emptyModel();

  private emptyModel(): NutritionEntry {
    return {
      date: localDateTime().slice(0, 10),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      notes: '',
      athleteId: undefined
    };
  }

  async ngOnInit(): Promise<void> {
    await this.refreshPage();
  }

  canCreateOrUpdate(): boolean {
    return this.auth.hasAnyRole(['ADMIN', 'COACH']);
  }

  canDelete(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async loadPageData(page = this.page()?.number ?? 0): Promise<void> {
    this.loading.set(true);
    this.listError.set('');
    try {
      this.page.set(await this.service.listPage(page));
    } catch (error) {
      console.error(error);
      this.page.set(null);
      this.listError.set(apiErrorKey(error, 'error.load'));
    } finally {
      this.loading.set(false);
    }
  }

  async refreshPage(): Promise<void> {
    await Promise.all([this.loadPageData(), this.loadOptions()]);
  }

  private async loadOptions(): Promise<void> {
    if (!this.canCreateOrUpdate()) return;

    this.optionsLoading.set(true);
    this.lookupError.set('');
    try {
      this.athletes.set(await this.athleteService.listAll());
    } catch (error) {
      console.error(error);
      this.lookupError.set('error.lookups');
    } finally {
      this.optionsLoading.set(false);
    }
  }

  startEdit(record: NutritionEntry): void {
    if (!this.canCreateOrUpdate()) {
      this.error.set('common.coachOnly');
      return;
    }
    if (record.id == null) {
      this.error.set('error.missingId');
      return;
    }

    this.error.set('');
    this.success.set('');
    this.editingId.set(record.id);
    this.model = { ...record };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async save(f: NgForm): Promise<void> {
    if (this.loading() || this.optionsLoading() || this.lookupError()) return;
    this.success.set('');

    if (!this.canCreateOrUpdate()) {
      this.error.set('common.coachOnly');
      return;
    }
    if (f.invalid) {
      this.error.set('validation.form');
      return;
    }
    const macros = [this.model.calories, this.model.protein, this.model.carbs, this.model.fat];
    if (macros.some(value => !Number.isInteger(Number(value)) || Number(value) > 2_147_483_647)) {
      this.error.set('validation.nutrition');
      return;
    }

    const id = this.editingId();
    const payload: NutritionEntry = {
      date: this.model.date,
      calories: Number(this.model.calories),
      protein: Number(this.model.protein),
      carbs: Number(this.model.carbs),
      fat: Number(this.model.fat),
      notes: this.model.notes || '',
      athleteId: this.model.athleteId
    };

    this.loading.set(true);
    this.error.set('');
    try {
      if (id === undefined) {
        await this.service.create(payload);
      } else {
        await this.service.update(id, payload);
      }

      this.resetForm(f);
      this.success.set(id === undefined ? 'common.created' : 'common.updated');
      await this.loadPageData(id === undefined ? 0 : this.page()?.number ?? 0);
    } catch (error) {
      console.error(error);
      this.error.set(apiErrorKey(error, 'error.save'));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id?: number): Promise<void> {
    if (this.loading()) return;
    if (!this.canDelete()) {
      this.error.set('common.adminOnly');
      return;
    }
    if (id == null) {
      this.error.set('error.missingId');
      return;
    }
    if (!confirm(this.t('common.confirmDelete'))) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.service.remove(id);
      if (this.editingId() === id) this.resetForm();
      this.success.set('common.deleted');
      await this.loadPageData();
    } catch (error) {
      console.error(error);
      this.error.set(apiErrorKey(error, 'error.delete'));
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(form?: NgForm): void {
    this.editingId.set(undefined);
    this.model = this.emptyModel();
    form?.resetForm(this.model);
    this.error.set('');
  }

  get totalCalories(): number {
    return this.list().reduce(
      (sum, entry) => sum + (Number(entry.calories) || 0),
      0
    );
  }

  get totals(): { p: number; c: number; f: number } {
    const entries = this.list();

    return {
      p: entries.reduce(
        (sum, entry) => sum + (Number(entry.protein) || 0),
        0
      ),
      c: entries.reduce(
        (sum, entry) => sum + (Number(entry.carbs) || 0),
        0
      ),
      f: entries.reduce(
        (sum, entry) => sum + (Number(entry.fat) || 0),
        0
      )
    };
  }
}
