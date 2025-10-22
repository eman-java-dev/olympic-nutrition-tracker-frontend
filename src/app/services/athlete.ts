import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Athlete {
  id?: number;
  name: string;
  age?: number;
  gender?: 'M' | 'F' | 'O';
  height?: number;
  weight?: number;
  bmi?: number;           // 👈 إضافة
}

const API = 'http://localhost:8080/api/athletes';

@Injectable({ providedIn: 'root' })
export class AthleteService {
  constructor(private http: HttpClient) {}

  listAthletes(): Observable<Athlete[]> {
    return this.http.get<Athlete[]>(API);
  }

  createAthlete(a: Athlete): Observable<Athlete> {
    return this.http.post<Athlete>(API, a);
  }

  deleteAthlete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
