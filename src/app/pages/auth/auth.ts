import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // نخزّن الحالة في signal + localStorage
  private _isLoggedIn = signal<boolean>(!!localStorage.getItem('user'));
  isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    // مؤقتًا حساب تجريبي؛ لاحقًا نربطه بالباك-إند
    if (username.trim() && password.trim()) {
      localStorage.setItem('user', username.trim());
      this._isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('user');
    this._isLoggedIn.set(false);
    this.router.navigateByUrl('/signin');
  }

  currentUser(): string | null {
    return localStorage.getItem('user');
  }
}
