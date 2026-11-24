import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Consultation, ConsultationService } from '../../services/consultation';
import { Athlete, AthleteService } from '../../services/athlete';
import { Coach, CoachService } from '../../services/coach';
import { apiErrorKey, ListPage } from '../../services/api';
import { AuthService } from '../../services/auth';
import { LangService } from '../../services/lang';
import { ListPagerComponent } from '../list-pager';
import { localDateTime } from '../local-date';

@Component({
    selector: 'app-consultations',
    imports: [CommonModule, FormsModule, ListPagerComponent],
    templateUrl: './consultations.html',
    styleUrl: './consultations.css'
})
export class ConsultationsComponent implements OnInit {
  private service = inject(ConsultationService);
  private athleteService = inject(AthleteService);
  private coachService = inject(CoachService);
  private auth = inject(AuthService);
  private lang = inject(LangService);

  t = (key: string) => this.lang.t(key);
  language = this.lang.lang;

  page = signal<ListPage<Consultation> | null>(null);
  list = () => this.page()?.items ?? [];
  editingId = signal<number | undefined>(undefined);
  loading = signal(false);
  error = signal('');
  listError = signal('');
  success = signal('');
  athletes = signal<Athlete[]>([]);
  coaches = signal<Coach[]>([]);
  optionsLoading = signal(false);
  lookupError = signal('');
  private originalSchedule?: string;

  model = this.emptyModel();

  private emptyModel(): Consultation {
    return {
      scheduledAt: localDateTime(),
      message: '',
      athleteId: undefined,
      coachId: undefined
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

  canChooseCoach(): boolean {
    return this.editingId() === undefined || this.auth.hasRole('ADMIN');
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
      const [athletes, coaches] = await Promise.all([
        this.athleteService.listAll(),
        this.coachService.listAll()
      ]);
      this.athletes.set(athletes);
      this.coaches.set(coaches);
    } catch (error) {
      console.error(error);
      this.lookupError.set('error.lookups');
    } finally {
      this.optionsLoading.set(false);
    }
  }

  startEdit(record: Consultation): void {
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
    this.originalSchedule = record.scheduledAt;
    this.model = { ...record, scheduledAt: record.scheduledAt?.slice(0, 16) ?? '' };
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
    if (!this.model.message?.trim()) {
      this.error.set('validation.consultation');
      return;
    }

    const id = this.editingId();
    const payload: Consultation = {
      scheduledAt: this.originalSchedule?.startsWith(this.model.scheduledAt)
        ? this.originalSchedule
        : this.model.scheduledAt,
      message: this.model.message.trim(),
      athleteId: this.model.athleteId,
      coachId: this.model.coachId
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
      const key = apiErrorKey(error, 'error.save');
      this.error.set(key === 'error.forbidden' && this.auth.hasRole('COACH')
        ? 'consult.assignmentRequired'
        : key);
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
    this.originalSchedule = undefined;
    this.model = this.emptyModel();
    form?.resetForm(this.model);
    this.error.set('');
  }

  getAthleteName(c: Consultation): string {
    if (c.athleteName) return c.athleteName;

    const id = Number(c.athleteId);
    const athlete = this.athletes().find(a => Number(a.id) === id);

    return athlete?.name || '—';
  }

  getCoachName(c: Consultation): string {
    if (c.coachName) return c.coachName;

    const id = Number(c.coachId);
    const coach = this.coaches().find(co => Number(co.id) === id);

    return coach?.name || '—';
  }
}
