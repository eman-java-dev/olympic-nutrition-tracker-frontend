import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

interface NutritionEntry {
  id?: number;
  athleteId: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string; // ISO yyyy-MM-dd
}

const API_BASE = 'http://localhost:8080/api/nutrition';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './nutrition.html',
  styleUrls: ['./nutrition.css']
})
export class NutritionComponent {
  list: NutritionEntry[] = [];
  form: NutritionEntry = {
    athleteId: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    date: new Date().toISOString().split('T')[0]
  };

  ok = '';
  err = '';
  loading = false;

  // فلاتر 
  startDate: string = '';
  endDate: string = '';

  // إعدادات المخطط (ألوان متناسقة مع التصميم)
  colorScheme = {
    name: 'brand',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1e3a8a', '#3b82f6', '#0f4c81']
  };
  gradient = true;
  showXAxis = true;
  showYAxis = true;
  showDataLabel = true;
  legend = false;
  xAxisLabel = 'Date';
  yAxisLabel = 'Calories';
  chartView: [number, number] = [700, 320]; // العرض والارتفاع بالمخطط
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
        this.err = 'Erreur lors du chargement.';
        this.loading = false;
      }
    });
  }

  add(): void {
    this.ok = ''; this.err = '';
    if (!this.form.calories || !this.form.protein || !this.form.carbs || !this.form.fats) {
      this.err = 'Veuillez remplir tous les champs.'; return;
    }

    this.http.post<NutritionEntry>(API_BASE, this.form).subscribe({
      next: () => {
        this.ok = 'Entrée nutritionnelle ajoutée.';
        this.form = {
          athleteId: 1,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          date: new Date().toISOString().split('T')[0]
        };
        this.load();
      },
      error: () => { this.err = 'Échec de l’ajout (API).'; }
    });
  }

  remove(id?: number): void {
    if (!id) return;
    this.http.delete(`${API_BASE}/${id}`).subscribe({
      next: () => this.load(),
      error: () => this.err = 'Échec de suppression.'
    });
  }

  //  تجميع السعرات لكل يوم لعرضها في المخطط 
  private groupByDate(): Record<string, number> {
    const map: Record<string, number> = {};
    for (const e of this.list) {
      const key = e.date;
      map[key] = (map[key] ?? 0) + (e.calories ?? 0);
    }
    return map;
  }

  get chartData() {
    const byDay = this.groupByDate();
    const days = Object.keys(byDay).sort(); //تساعدني
    return days.map(d => ({ name: d, value: byDay[d] }));
  }

  get yMax(): number {
    if (!this.chartData.length) return 0; // بدل null
    const max = Math.max(...this.chartData.map(d => d.value));
    return Math.max(max, 200);
  }
  
  }

