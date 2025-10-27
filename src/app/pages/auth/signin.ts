import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-signin',
  imports: [CommonModule, FormsModule], // شِلّنا RouterLink لأنه غير مستخدَم
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SignInComponent {
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;

  async login(f: NgForm) {
    if (this.loading || !f.valid) return;
    this.loading = true;
    await new Promise(r => setTimeout(r, 900));
    const ok = this.username?.trim() && this.password?.length >= 4;
    if (ok) {
      localStorage.setItem('auth', JSON.stringify({ u: this.username, t: Date.now() }));
      this.router.navigateByUrl('/');
    } else {
      alert('Identifiants invalides.');
    }
    this.loading = false;
  }

  back() {
    history.length > 1 ? history.back() : this.router.navigateByUrl('/');
  }

  private reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMove(ev: MouseEvent) {
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

  onLeave() {
    document.querySelectorAll<HTMLElement>('.signin-card')
      .forEach(el => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
}
