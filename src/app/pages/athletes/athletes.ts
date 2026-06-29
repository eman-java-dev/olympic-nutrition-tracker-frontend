import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Athlete, AthleteService } from '../../services/athlete';
import { LangService } from '../../services/lang';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-athletes',
  imports: [CommonModule, FormsModule],
  templateUrl: './athletes.html',
  styleUrl: './athletes.css'
})
export class AthletesComponent implements OnInit {
  private service = inject(AthleteService);
  private i18n = inject(LangService);
  auth = inject(AuthService);

  t = (k: string) => this.i18n.t(k);

  list = () => this.service.list();

  model: Athlete = {
    name: '',
    age: undefined,
    weight: undefined,
    height: undefined
  };

  editingId = signal<number | undefined>(undefined);
  loading = signal<boolean>(false);
  error = signal<string>('');

  async ngOnInit(): Promise<void> {
    await this.loadAthletes();
  }

  canManageAthletes(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async loadAthletes(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.init();
    } catch (e) {
      console.error(e);
      this.error.set('Impossible de charger les athlètes. Vérifiez que le backend est démarré.');
    } finally {
      this.loading.set(false);
    }
  }

  startEdit(a: Athlete): void {
    if (!this.canManageAthletes()) {
      this.error.set('Accès refusé : seul l’administrateur peut modifier les athlètes.');
      return;
    }

    this.editingId.set(a.id);
    this.model = { ...a };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async save(f: NgForm): Promise<void> {
    if (!this.canManageAthletes()) {
      this.error.set('Accès refusé : seul l’administrateur peut gérer les athlètes.');
      return;
    }

    if (!this.model.name?.trim()) {
      this.error.set('Veuillez saisir le nom de l’athlète.');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set('');

      const id = this.editingId();

      const payload: Athlete = {
        name: this.model.name.trim(),
        age: this.model.age,
        weight: this.model.weight,
        height: this.model.height
      };

      if (id !== undefined) {
        await this.service.update(id, payload);
      } else {
        await this.service.create(payload);
      }

      this.resetForm(f);
      await this.loadAthletes();
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de l’enregistrement. Vérifiez les données et le backend.');
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id?: number): Promise<void> {
    if (!this.canManageAthletes()) {
      this.error.set('Accès refusé : seul l’administrateur peut supprimer les athlètes.');
      return;
    }

    if (id === undefined || id === null) return;

    if (!confirm(this.t('common.confirmDelete') || 'Supprimer ?')) return;

    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.remove(id);
      await this.loadAthletes();

      if (this.editingId() === id) {
        this.editingId.set(undefined);
      }
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de la suppression.');
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(f: NgForm): void {
    this.editingId.set(undefined);
    f.resetForm();

    this.model = {
      name: '',
      age: undefined,
      weight: undefined,
      height: undefined
    };
  }
}