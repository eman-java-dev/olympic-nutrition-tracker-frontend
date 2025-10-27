import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl; 
  async get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.base}${path}`));
  }
  async post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.base}${path}`, body));
  }
  async put<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.base}${path}`, body));
  }
  async delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.base}${path}`));
  }
}
