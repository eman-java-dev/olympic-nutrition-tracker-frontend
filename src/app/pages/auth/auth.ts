import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type Role = 'ADMIN' | 'COACH' | 'ATHLETE';

export interface AppUser {
  username: string;
  password: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'nt_user';

  private users: AppUser[] = [
    { username: 'admin', password: 'admin123', role: 'ADMIN' },
    { username: 'coach01', password: '123456', role: 'COACH' },
    { username: 'athlete01', password: '123456', role: 'ATHLETE' },
  ];

  private _user = signal<AppUser | null>(this.getStoredUser());
  user = this._user.asReadonly();

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    const found = this.users.find(
      u => u.username === username.trim() && u.password === password.trim()
    );

    if (!found) return false;

    localStorage.setItem(this.key, JSON.stringify(found));
    this._user.set(found);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.key);
    this._user.set(null);
    this.router.navigateByUrl('/signin');
  }

  isLoggedIn(): boolean {
    return !!this._user();
  }

  hasRole(role: Role): boolean {
    return this._user()?.role === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    const currentRole = this._user()?.role;
    return !!currentRole && roles.includes(currentRole);
  }

  currentUser(): AppUser | null {
    return this._user();
  }

  private getStoredUser(): AppUser | null {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) as AppUser : null;
  }
}