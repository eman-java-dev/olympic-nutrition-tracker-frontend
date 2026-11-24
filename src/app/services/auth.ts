import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiRequestTimeout, requestTimedOut } from './api';
import { readLocalPreference, writeLocalPreference } from './browser-storage';
import { environment } from '../../environments/environment';

export type Role = 'ADMIN' | 'COACH' | 'ATHLETE';

export interface User {
  readonly username: string;
  readonly role: Role;
  readonly token: string;
}

interface Session {
  user: User;
  expiresAt: number;
}

type SessionNotice = 'expired' | 'rejected';
type SessionValidation = { session: Session } | { error: 'expired' | 'invalid-response' };
export type LoginError = 'credentials' | 'forbidden' | 'unavailable' | 'failed'
  | 'expired' | 'invalid-response' | 'throttled';

function decodeJwtObject(segment: string): Record<string, unknown> {
  const decoded = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(decoded, character => character.charCodeAt(0));
  const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid JWT object');
  }
  return value;
}

function validateSession(value: unknown): SessionValidation {
  const { username, role, token } = (value ?? {}) as Partial<User>;
  if (typeof username !== 'string' || !username.trim()
    || (role !== 'ADMIN' && role !== 'COACH' && role !== 'ATHLETE')
    || typeof token !== 'string') {
    return { error: 'invalid-response' };
  }

  const segments = token.split('.');
  if (segments.length !== 3 || !segments.every(segment =>
    /^[A-Za-z0-9_-]+$/.test(segment) && segment.length % 4 !== 1)) {
    return { error: 'invalid-response' };
  }

  // Spring Boot verifies the signature. These checks validate the local session.
  try {
    const header = decodeJwtObject(segments[0]);
    const claims = decodeJwtObject(segments[1]);
    if (typeof header['alg'] !== 'string' || !header['alg'] || header['alg'] === 'none'
      || claims['sub'] !== username || typeof claims['exp'] !== 'number') {
      return { error: 'invalid-response' };
    }

    const expiresAt = claims['exp'] * 1000;
    if (!Number.isFinite(expiresAt)) return { error: 'invalid-response' };
    if (expiresAt <= Date.now()) return { error: 'expired' };
    return { session: { user: { username, role, token }, expiresAt } };
  } catch {
    return { error: 'invalid-response' };
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storeKey = 'nt_session';
  private readonly session = signal<Session | null>(null);
  private readonly notice = signal<SessionNotice | null>(null);
  private readonly retryAfter = signal<number | null>(null);
  readonly retryAfterSeconds = this.retryAfter.asReadonly();
  private expiryTimer?: number;
  readonly sessionNotice = this.notice.asReadonly();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Older sessions may contain a guessed role or a demo password.
    writeLocalPreference('nt_user', null);
    this.restoreSession();
  }

  async login(username: string, password: string): Promise<LoginError | null> {
    this.notice.set(null);
    this.retryAfter.set(null);
    username = username.trim();
    if (!username || !password) return 'credentials';

    try {
      const response = await firstValueFrom(
        this.http.post<unknown>(environment.apiUrl + '/auth/login', { username, password }).pipe(apiRequestTimeout(75_000))
      );

      const result = validateSession(response);
      if ('error' in result) return result.error;

      writeLocalPreference(this.storeKey, JSON.stringify(result.session.user));
      this.startSession(result.session);
      return null;
    } catch (error) {
      if (requestTimedOut(error)) return 'unavailable';
      if (error instanceof HttpErrorResponse) {
        if (error.status === 429) {
          const header = error.headers.get('Retry-After');
          const seconds = header && /^\d+$/.test(header) ? Number(header) : null;
          this.retryAfter.set(Number.isSafeInteger(seconds) ? seconds : null);
          return 'throttled';
        }
        if (error.status === 401) return 'credentials';
        if (error.status === 403) return 'forbidden';
        if (error.status === 0 || error.status >= 500) return 'unavailable';
      }
      return 'failed';
    }
  }

  private restoreSession(): void {
    const raw = readLocalPreference(this.storeKey);
    if (raw === null) return;

    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      value = null;
    }

    const result = validateSession(value);
    if ('session' in result) {
      this.startSession(result.session);
    } else {
      this.clearSession(result.error === 'expired' ? 'expired' : 'rejected');
    }
  }

  private startSession(session: Session): void {
    window.clearTimeout(this.expiryTimer);
    this.session.set(session);
    this.scheduleExpiry(session);
  }

  private scheduleExpiry(session: Session): void {
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      this.endSession('expired');
      return;
    }
    this.expiryTimer = window.setTimeout(() => this.scheduleExpiry(session),
      Math.min(remaining, 2_147_483_647));
  }

  private clearSession(notice: SessionNotice | null): void {
    window.clearTimeout(this.expiryTimer);
    writeLocalPreference(this.storeKey, null);
    this.session.set(null);
    this.notice.set(notice);
  }

  private endSession(notice: SessionNotice | null): void {
    this.clearSession(notice);
    void this.router.navigateByUrl('/signin');
  }

  logout(): void {
    this.endSession(null);
  }

  rejectSession(user: User): void {
    const session = this.session();
    if (session?.user !== user) return;

    this.endSession(session.expiresAt <= Date.now() ? 'expired' : 'rejected');
  }

  currentUser(): User | null {
    const session = this.session();
    return session && session.expiresAt > Date.now() ? session.user : null;
  }

  currentRole(): Role | null {
    return this.currentUser()?.role ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  hasRole(role: Role): boolean {
    return this.currentRole() === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    const role = this.currentRole();
    return !!role && roles.includes(role);
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/signin']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree(['/home']) : true;
};
