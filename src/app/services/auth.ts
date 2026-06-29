import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export type Role = 'ADMIN' | 'COACH' | 'ATHLETE';

export interface User {
  username: string;
  role: Role;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storeKey = 'nt_user';

  private _isLoggedIn = signal<boolean>(!!localStorage.getItem(this.storeKey));
  isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private router: Router) {}

  async login(username: string, password: string): Promise<boolean> {
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) return false;

    let role: Role;

    if (u === 'admin' && p === 'admin123') {
      role = 'ADMIN';
    } else if (u === 'coach01' && p === '123456') {
      role = 'COACH';
    } else if (u === 'athlete01' && p === '123456') {
      role = 'ATHLETE';
    } else {
      return false;
    }

    const user: User = {
      username: u,
      role,
      token: btoa(`${u}:${p}`)
    };

    localStorage.setItem(this.storeKey, JSON.stringify(user));
    this._isLoggedIn.set(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.storeKey);
    this._isLoggedIn.set(false);
    this.router.navigateByUrl('/signin');
  }

  currentUser(): User | null {
    const raw = localStorage.getItem(this.storeKey);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(this.storeKey);
      return null;
    }
  }

  currentRole(): Role | null {
    return this.currentUser()?.role ?? null;
  }

  currentToken(): string | null {
    return this.currentUser()?.token ?? null;
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

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/signin']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};