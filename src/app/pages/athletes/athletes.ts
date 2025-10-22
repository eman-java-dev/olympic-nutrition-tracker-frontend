import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AthleteService, Athlete } from '../../services/athlete';

@Component({
  selector: 'app-athletes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './athletes.html',
  styleUrls: ['./athletes.css']
})
export class AthletesComponent implements OnInit {
  athletes: Athlete[] = [];

  // القالب يستخدم newAthlete -> نوفّرها، ونُبقي form د لاحقًا
  form: Athlete = { name: '', gender: 'M' };
  get newAthlete(): Athlete { return this.form; }   // 👈 يرضي القالب

  loading = false;          // 👈 حتى تعمل *ngIf="loading"
  success = '';
  error = '';

  constructor(private svc: AthleteService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = ''; this.success = '';
    this.svc.listAthletes().subscribe({
      next: (d: Athlete[]) => { this.athletes = d; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  // القالب ينادي create() -> نربطها بدالة add()
  create(): void { this.add(); }                    // 👈

  add(): void {
    this.error = ''; this.success = '';
    if (!this.form.name) { this.error = 'Le nom est requis.'; return; }
    this.svc.createAthlete(this.form).subscribe({
      next: () => {
        this.success = 'Athlète créé avec succès.';
        this.form = { name: '', gender: 'M' };
        this.load();
      },
      error: () => { this.error = 'Échec de création (API).'; }
    });
  }

  remove(id?: number): void {
    if (!id) return;
    this.svc.deleteAthlete(id).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Échec de suppression.'; }
    });
  }

  // القالب يستخدم trackById -> نوفّرها
  trackById(index: number, a: Athlete): number {    // 👈
    return a.id ?? index;
  }
}
