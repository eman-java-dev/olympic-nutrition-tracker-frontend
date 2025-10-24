import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Consultation {
  id?: number;
  athleteId: number;
  topic: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const API_BASE = 'http://localhost:8080/api/consultations';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultations.html',
  styleUrls: ['./consultations.css']   //  مهم
})
export class ConsultationsComponent {
  list: Consultation[] = [];
  form: Consultation = { athleteId: 1, topic: '', message: '', priority: 'MEDIUM' };
  ok = '';
  err = '';
  loading = false;

  constructor(private http: HttpClient) {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get<any>(API_BASE).subscribe({
      next: (res) => {
        this.list = res.content ?? res; // يدعم Page أو Array
        this.loading = false;
      },
      error: () => {
        this.err = 'Échec du chargement (API).';
        this.loading = false;
      }
    });
  }

  add(): void {
    this.ok = ''; this.err = '';
    if (!this.form.topic || !this.form.message) {
      this.err = 'Veuillez remplir tous les champs.';
      return;
    }
    this.http.post<Consultation>(API_BASE, this.form).subscribe({
      next: () => {
        this.ok = 'Consultation ajoutée.';
        this.form = { athleteId: 1, topic: '', message: '', priority: 'MEDIUM' };
        this.load();
      },
      error: () => {
        this.err = 'Échec de création (API).';
      }
    });
  }

  remove(id?: number): void {
    if (!id) return;
    this.http.delete(`${API_BASE}/${id}`).subscribe({
      next: () => this.load(),
      error: () => this.err = 'Échec de suppression.'
    });
  }
}
