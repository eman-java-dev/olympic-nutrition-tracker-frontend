import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Consultation, ConsultationService } from '../../services/consultation';
import { Athlete, AthleteService } from '../../services/athlete';
import { Coach, CoachService } from '../../services/coach';
import { LangService } from '../../services/lang';

function nowLocalDateTime(): string {
  return new Date().toISOString().slice(0, 16);
}

@Component({
  standalone: true,
  selector: 'app-consultations',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultations.html',
  styleUrl: './consultations.css'
})
export class ConsultationsComponent implements OnInit {
  private service = inject(ConsultationService);
  private athleteService = inject(AthleteService);
  private coachService = inject(CoachService);
  private lang = inject(LangService);

  t = (k: string) => this.lang.t(k);

  list = () => this.service.list();

  athletes = signal<Athlete[]>([]);
  coaches = signal<Coach[]>([]);
  editingId = signal<number | undefined>(undefined);
  loading = signal<boolean>(false);
  error = signal<string>('');

  model: Consultation = {
    scheduledAt: nowLocalDateTime(),
    message: '',
    athleteId: undefined,
    coachId: undefined
  };

  async ngOnInit(): Promise<void> {
    await this.loadPageData();
  }

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');

      await this.athleteService.init();
      await this.coachService.init();
      await this.service.init();

      this.athletes.set(this.athleteService.list());
      this.coaches.set(this.coachService.list());
    } catch (e) {
      console.error(e);
      this.error.set('Impossible de charger les consultations. Vérifiez que le backend est démarré.');
    } finally {
      this.loading.set(false);
    }
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

  startEdit(c: Consultation): void {
    this.editingId.set(c.id);

    this.model = {
      id: c.id,
      scheduledAt: c.scheduledAt?.slice(0, 16),
      message: c.message,
      athleteId: c.athleteId,
      coachId: c.coachId,
      athleteName: c.athleteName,
      coachName: c.coachName
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async save(f: NgForm): Promise<void> {
    if (!this.model.athleteId || !this.model.coachId || !this.model.message?.trim()) {
      this.error.set('Veuillez sélectionner un athlète, un coach et saisir un message.');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set('');

      const payload: Consultation = {
        scheduledAt: this.model.scheduledAt,
        message: this.model.message.trim(),
        athleteId: Number(this.model.athleteId),
        coachId: Number(this.model.coachId)
      };

      const id = this.editingId();

      if (id) {
        await this.service.update(id, payload);
      } else {
        await this.service.create(payload);
      }

      this.resetForm(f);
      await this.loadPageData();
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de l’enregistrement de la consultation.');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id?: number): Promise<void> {
    if (!id) return;
    if (!confirm('Supprimer cette consultation ?')) return;

    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.remove(id);

      if (this.editingId() === id) {
        this.editingId.set(undefined);
      }

      await this.loadPageData();
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de la suppression.');
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(f: NgForm): void {
    f.resetForm();

    this.model = {
      scheduledAt: nowLocalDateTime(),
      message: '',
      athleteId: undefined,
      coachId: undefined
    };

    this.editingId.set(undefined);
  }
}