
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Athlete, AthleteService } from '../../services/athlete';
import { apiErrorKey, ListPage } from '../../services/api';
import { AuthService } from '../../services/auth';
import { LangService } from '../../services/lang';
import { ListPagerComponent } from '../list-pager';

@Component({
    selector: 'app-athletes',
    imports: [FormsModule, ListPagerComponent],
    templateUrl: './athletes.html',
    styleUrl: './athletes.css'
})
export class AthletesComponent implements OnInit {
  private service = inject(AthleteService);
  private auth = inject(AuthService);
  private lang = inject(LangService);

  t = (key: string) => this.lang.t(key);

  page = signal<ListPage<Athlete> | null>(null);
  list = () => this.page()?.items ?? [];
  editingId = signal<number | undefined>(undefined);
  loading = signal(false);
  error = signal('');
  listError = signal('');
  success = signal('');

  model = this.emptyModel();

  private emptyModel(): Athlete {
    return { name: '', age: undefined, weight: undefined, height: undefined };
  }

  async ngOnInit(): Promise<void> {
    await this.loadAthletes();
  }

  canManageAthletes(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async loadAthletes(page = this.page()?.number ?? 0): Promise<void> {
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

  startEdit(record: Athlete): void {
    if (!this.canManageAthletes()) {
      this.error.set('common.adminOnly');
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
    if (this.loading()) return;
    this.success.set('');

    if (!this.canManageAthletes()) {
      this.error.set('common.adminOnly');
      return;
    }
    if (f.invalid) {
      this.error.set('validation.form');
      return;
    }
    if (!this.model.name?.trim()) {
      this.error.set('validation.name');
      return;
    }
    if (this.model.age != null && !Number.isInteger(this.model.age)) {
      this.error.set('validation.age');
      return;
    }

    const id = this.editingId();
    const payload: Athlete = {
      name: this.model.name.trim(),
      age: this.model.age,
      gender: this.model.gender,
      weight: this.model.weight,
      height: this.model.height
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
      await this.loadAthletes(id === undefined ? 0 : this.page()?.number ?? 0);
    } catch (error) {
      console.error(error);
      this.error.set(apiErrorKey(error, 'error.save'));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id?: number): Promise<void> {
    if (this.loading()) return;
    if (!this.canManageAthletes()) {
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
      await this.loadAthletes();
    } catch (error) {
      console.error(error);
      const key = apiErrorKey(error, 'error.delete');
      this.error.set(key === 'error.conflict' ? 'athletes.deleteConflict' : key);
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
}
