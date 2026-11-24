import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../environments/environment';

export function apiRequestTimeout<T>(milliseconds = 15_000) {
  return timeout<T>({ first: milliseconds });
}

export function requestTimedOut(error: unknown): boolean {
  return error instanceof TimeoutError;
}

export interface ListPage<T> {
  items: T[];
  number: number;
  size: number;
  totalPages: number;
}

interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalPages: number;
}

export function singlePage<T>(items: T[]): ListPage<T> {
  return { items, number: 0, size: items.length, totalPages: items.length ? 1 : 0 };
}

export function apiErrorKey(error: unknown, fallback: string): string {
  if (requestTimedOut(error)) return fallback === 'error.save' || fallback === 'error.delete'
    ? 'error.writeTimeout' : 'error.unavailable';
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'error.unavailable';
  if (error.status === 401) return 'error.unauthorized';
  if (error.status === 403) return 'error.forbidden';
  if (error.status === 429) return 'error.throttled';
  if (error.status === 409) return 'error.conflict';
  if ((error.status === 400 || error.status === 422) && fallback === 'error.save') {
    return 'error.invalidData';
  }
  return error.status >= 500 ? 'error.service' : fallback;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  async get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.base}${path}`).pipe(apiRequestTimeout<T>()));
  }

  async getPage<T>(path: string, page: number): Promise<ListPage<T>> {
    const result = await this.readPage<T>(path, page, 20, 'id,desc');
    const last = Math.max(0, result.totalPages - 1);
    return page > last ? this.readPage<T>(path, last, 20, 'id,desc') : result;
  }

  async getAllPages<T>(path: string): Promise<T[]> {
    const first = await this.readPage<T>(path, 0, 100);
    const items = [...first.items];
    for (let index = 1; index < first.totalPages; index++) {
      const page = await this.readPage<T>(path, index, 100);
      items.push(...page.items);
    }
    return items;
  }

  private async readPage<T>(path: string, page: number, size: number, sort = 'id,asc'): Promise<ListPage<T>> {
    const params = { page, size, sort };
    const response = await firstValueFrom(
      this.http.get<T[] | SpringPage<T>>(this.base + path, { params }).pipe(apiRequestTimeout<T[] | SpringPage<T>>())
    );
    if (Array.isArray(response)) return singlePage(response);
    if (!Array.isArray(response?.content) || response.number !== page
      || !Number.isInteger(response.size) || response.size < 1
      || !Number.isInteger(response.totalPages) || response.totalPages < 0) {
      throw new Error('Invalid page response');
    }
    return {
      items: response.content,
      number: response.number,
      size: response.size,
      totalPages: response.totalPages
    };
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.base}${path}`, body).pipe(apiRequestTimeout<T>()));
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.base}${path}`, body).pipe(apiRequestTimeout<T>()));
  }

  async delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.base}${path}`).pipe(apiRequestTimeout<T>()));
  }
}