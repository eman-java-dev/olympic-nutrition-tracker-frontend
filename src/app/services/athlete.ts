import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Athlete {
  id: number;
  name: string;
  age: number | null;
  sex: 'M' | 'F';
  heightCm: number | null;
  weightKg: number | null;
  bmi?: number | null;
}

export interface AthleteCreateDTO {
  name: string;
  age: number | null;
  sex: 'M' | 'F';
  heightCm: number | null;
  weightKg: number | null;
}

type ApiAthlete = {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;   // "M" | "F"
  height: number | null;   // ← اسم الحقل في الباك
  weight: number | null;   // ← اسم الحقل في الباك
  bmi?: number | null;
};

@Injectable({ providedIn: 'root' })
export class AthleteService {
  private base = `${environment.apiUrl}/athletes`;

  constructor(private http: HttpClient) {}

  //  Mapping helpers 
  private apiToUi(a: ApiAthlete): Athlete {
    return {
      id: a.id,
      name: a.name,
      age: a.age ?? null,
      sex: (a.gender ?? 'F').toUpperCase() === 'M' ? 'M' : 'F',
      heightCm: a.height ?? null,
      weightKg: a.weight ?? null,
      bmi: a.bmi ?? null
    };
  }

  private dtoToApi(dto: Partial<AthleteCreateDTO>): Partial<ApiAthlete> {
    const body: Partial<ApiAthlete> = {};
    if (dto.name !== undefined) body.name = dto.name;
    if (dto.age !== undefined) body.age = dto.age;
    if (dto.sex !== undefined) body.gender = dto.sex;
    if (dto.heightCm !== undefined) body.height = dto.heightCm;
    if (dto.weightKg !== undefined) body.weight = dto.weightKg;
    return body;
  }

  //  API 

  getAll(): Observable<Athlete[]> {
    return this.http.get<any>(this.base).pipe(
      map(res => {
        const arr: ApiAthlete[] = Array.isArray(res) ? res : (res?.content ?? []);
        return (arr ?? []).map(a => this.apiToUi(a));
      })
    );
  }

  findById(id: number): Observable<Athlete> {
    return this.http.get<ApiAthlete>(`${this.base}/${id}`).pipe(
      map(a => this.apiToUi(a))
    );
  }

  create(dto: AthleteCreateDTO): Observable<Athlete> {
    const body = this.dtoToApi(dto);
    return this.http.post<ApiAthlete>(this.base, body).pipe(
      map(a => this.apiToUi(a))
    );
  }

  update(id: number, dto: Partial<AthleteCreateDTO>): Observable<Athlete> {
    const body = this.dtoToApi(dto);
    return this.http.put<ApiAthlete>(`${this.base}/${id}`, body).pipe(
      map(a => this.apiToUi(a))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
