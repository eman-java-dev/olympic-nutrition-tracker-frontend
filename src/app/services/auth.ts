import { Injectable } from '@angular/core';

type Role = 'coach' | 'athlete' | 'admin';
export interface User { username: string; role: Role; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storeKey = 'nt_user';

  // حسابات تجريبية محليًا
  private users = [
    { username: 'coach01', password: '123456', role: 'coach' as Role },
    { username: 'admin',   password: 'admin',  role: 'admin' as Role },
  ];

  async signIn(username: string, password: string): Promise<User | null> {
    // محاكاة تأخير الشبكة
    await new Promise(r => setTimeout(r, 400));
    const found = this.users.find(u => u.username === username && u.password === password);
    if (!found) return null;

    const user: User = { username: found.username, role: found.role };
    localStorage.setItem(this.storeKey, JSON.stringify(user));
    return user;
  }

  signOut(): void {
    localStorage.removeItem(this.storeKey);
  }

  currentUser(): User | null {
    const raw = localStorage.getItem(this.storeKey);
    return raw ? JSON.parse(raw) as User : null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }
}
