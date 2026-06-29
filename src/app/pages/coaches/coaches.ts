import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Coach, CoachService } from '../../services/coach';
import { LangService } from '../../services/lang';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-coaches',
  imports: [CommonModule, FormsModule],
  templateUrl: './coaches.html',
})
export class CoachesComponent implements OnInit {
  private service = inject(CoachService);
  private lang = inject(LangService);
  auth = inject(AuthService);

  t = (k: string) => this.lang.t(k);

  list = signal<Coach[]>([]);
  editingId = signal<number | null>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');

  model: Coach = {
    name: '',
    specialty: '',
    email: '',
    phone: ''
  };

  async ngOnInit(): Promise<void> {
    await this.loadCoaches();
  }

  canManageCoaches(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  async loadCoaches(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.init();
      this.list.set(this.service.list());
    } catch (e) {
      console.error(e);
      this.error.set('Impossible de charger les coachs. Vérifiez que le backend est démarré.');
    } finally {
      this.loading.set(false);
    }
  }

  async save(f: NgForm): Promise<void> {
    if (!this.canManageCoaches()) {
      this.error.set('Accès refusé : seul l’administrateur peut gérer les coachs.');
      return;
    }

    if (!this.model.name?.trim()) {
      this.error.set('Veuillez saisir le nom du coach.');
      return;
    }

    try {
      this.loading.set(true);
      this.error.set('');

      const id = this.editingId();

      const payload: Coach = {
        name: this.model.name.trim(),
        specialty: this.model.specialty?.trim() || '',
        email: this.model.email?.trim() || '',
        phone: this.model.phone?.trim() || ''
      };

      if (id !== null) {
        await this.service.update(id, payload);
      } else {
        await this.service.create(payload);
      }

      this.cancel(f);
      await this.loadCoaches();
    } catch (e) {
      console.error(e);
      this.error.set('Erreur lors de l’enregistrement du coach.');
    } finally {
      this.loading.set(false);
    }
  }

  edit(c: Coach): void {
    if (!this.canManageCoaches()) {
      this.error.set('Accès refusé : seul l’administrateur peut modifier un coach.');
      return;
    }

    this.editingId.set(c.id ?? null);
    this.model = { ...c };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancel(f: NgForm): void {
    this.editingId.set(null);
    f.resetForm();

    this.model = {
      name: '',
      specialty: '',
      email: '',
      phone: ''
    };
  }

  async remove(id?: number): Promise<void> {
    if (!this.canManageCoaches()) {
      this.error.set('Accès refusé : seul l’administrateur peut supprimer un coach.');
      return;
    }

    if (id === undefined || id === null) return;
    if (!confirm('Supprimer ce coach ?')) return;

    try {
      this.loading.set(true);
      this.error.set('');

      await this.service.remove(id);
      await this.loadCoaches();

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
}