import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LangService } from '../../services/lang';

@Component({
    selector: 'app-signin',
    imports: [FormsModule],
    templateUrl: './signin.html',
    styleUrl: './signin.css'
})
export class SignInComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private location = inject(Location);
  private lang = inject(LangService);

  t = (key: string) => this.lang.t(key);

  get errorMessage(): string {
    const retry = this.auth.retryAfterSeconds();
    return this.error === 'auth.throttled' && retry !== null
      ? this.t('auth.retryAfter').replace('{seconds}', String(retry))
      : this.t(this.error || this.sessionMessage);
  }

  get canGoBack(): boolean {
    return window.history.length > 1;
  }

  username = '';
  password = '';
  loading = false;
  error = '';

  get sessionMessage(): string {
    const notice = this.auth.sessionNotice();
    if (notice === 'expired') return 'auth.sessionExpired';
    if (notice === 'rejected') return 'auth.sessionRejected';
    return '';
  }

  async login(f: NgForm): Promise<void> {
    if (this.loading || !f.valid) return;

    this.loading = true;
    this.error = '';

    try {
      const error = await this.auth.login(this.username, this.password);
      if (error) {
        this.error = 'auth.' + error;
        return;
      }
      await this.router.navigateByUrl('/home');
    } finally {
      this.loading = false;
    }
  }

  back(): void {
    if (this.canGoBack) this.location.back();
  }

  private reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMove(ev: MouseEvent): void {
    if (this.reduceMotion) return;

    const el = ev.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();

    const px = (ev.clientX - r.left) / r.width;
    const py = (ev.clientY - r.top) / r.height;

    const ry = (px - 0.5) * 12;
    const rx = -(py - 0.5) * 8;

    el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
  }

  onLeave(): void {
    document.querySelectorAll<HTMLElement>('.signin-card')
      .forEach(el => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
  }
}
