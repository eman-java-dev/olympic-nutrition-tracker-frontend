import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Coach, CoachService } from '../../services/coach';
import { apiErrorKey, ListPage } from '../../services/api';
import { AuthService } from '../../services/auth';
import { LangService } from '../../services/lang';
import { ListPagerComponent } from '../list-pager';

@Component({
    selector: 'app-coaches',
    imports: [CommonModule, FormsModule, ListPagerComponent],
    templateUrl: './coaches.html'
})
export class CoachesComponent implements OnInit {
  private service = inject(CoachService);
  private auth = inject(AuthService);
  private lang = inject(LangService);

  t = (key: string) => this.lang.t(key);

  page = signal<ListPage<Coach> | null>(null);
  list = () => this.page()?.items ?? [];
  editingId = signal<number | undefined>(undefined);
  loading = signal(false);
  error = signal('');
  listError = signal('');
  success = signal('');

  model = this.emptyModel();

  private emptyModel(): Coach {
    return { name: '', specialty: '', email: '', phone: '' };
  }

  async ngOnInit(): Promise<void> {
    await this.loadCoaches();
  }

  canManageCoaches(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async loadCoaches(page = this.page()?.number ?? 0): Promise<void> {
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

  edit(record: Coach): void {
    if (!this.canManageCoaches()) {
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

    if (!this.canManageCoaches()) {
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

    const id = this.editingId();
    const payload: Coach = {
      name: this.model.name.trim(),
      specialty: this.model.specialty?.trim() || '',
      email: this.model.email?.trim() || '',
      phone: this.model.phone?.trim() || ''
    };

    this.loading.set(true);
    this.error.set('');
    try {
      if (id === undefined) {
        await this.service.create(payload);
      } else {
        await this.service.update(id, payload);
      }

      this.cancel(f);
      this.success.set(id === undefined ? 'common.created' : 'common.updated');
      await this.loadCoaches(id === undefined ? 0 : this.page()?.number ?? 0);
    } catch (error) {
      console.error(error);
      this.error.set(apiErrorKey(error, 'error.save'));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id?: number): Promise<void> {
    if (this.loading()) return;
    if (!this.canManageCoaches()) {
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
      if (this.editingId() === id) this.cancel();
      this.success.set('common.deleted');
      await this.loadCoaches();
    } catch (error) {
      console.error(error);
      this.error.set(apiErrorKey(error, 'error.delete'));
    } finally {
      this.loading.set(false);
    }
  }

  cancel(form?: NgForm): void {
    this.editingId.set(undefined);
    this.model = this.emptyModel();
    form?.resetForm(this.model);
    this.error.set('');
  }
}
