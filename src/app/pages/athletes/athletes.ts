import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Athlete, AthleteCreateDTO, AthleteService } from '../../services/athlete';

@Component({
  selector: 'app-athletes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './athletes.html'
})
export class AthletesComponent implements OnInit {
  list: Athlete[] = [];
  loading = false;
  ok = '';
  err = '';

  form: AthleteCreateDTO = {
    name: '',
    age: null,
    sex: 'F',
    heightCm: null,
    weightKg: null
  };

  constructor(private service: AthleteService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ok = ''; this.err = ''; this.loading = true;
    this.service.getAll().subscribe({
      next: (d) => { this.list = d ?? []; this.loading = false; },
      error: () => { this.err = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  add(f: NgForm): void {
    this.ok = ''; this.err = '';
    if (f.invalid || !this.form.name) {
      this.err = 'Veuillez compléter le formulaire.'; return;
    }
    this.service.create(this.form).subscribe({
      next: () => {
        this.ok = 'Athlete ajouté(e).';
        // إعادة ضبط النموذج
        this.form = { name: '', age: null, sex: 'F', heightCm: null, weightKg: null };
        f.resetForm({ sex: 'F' });
        this.load();
      },
      error: () => this.err = 'Échec de création.'
    });
  }

  /** حذف سريع (مع تأكيد بسيط) */
  remove(id?: number): void {
    if (!id) { return; }
    const ok = confirm('Supprimer cet(te) athlète ?');
    if (!ok) { return; }

    // حذف متفائل: نخفي من الواجهة مباشرة
    const old = this.list.slice();
    this.list = this.list.filter(a => a.id !== id);

    this.service.delete(id).subscribe({
      next: () => { this.ok = 'Supprimé.'; },
      error: () => { this.err = 'Échec de suppression.'; this.list = old; }
    });
  }

  /** حساب BMI للعرض إن لم يأتِ من الـ API */
  bmiOf(a: Athlete): string {
    const h = (a.heightCm ?? 0) / 100;
    const w = (a.weightKg ?? 0);
    if (!h || !w) { return '-'; }
    const bmi = w / (h * h);
    return bmi ? bmi.toFixed(1) : '-';
  }
}
