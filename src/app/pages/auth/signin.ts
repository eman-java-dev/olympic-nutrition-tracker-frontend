import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-signin',
  imports: [CommonModule, FormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SignInComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  username = '';
  password = '';
  loading = false;
  error = '';

  async login(f: NgForm): Promise<void> {
    if (this.loading || !f.valid) return;

    this.loading = true;
    this.error = '';

    await new Promise(resolve => setTimeout(resolve, 400));

    const ok = await this.auth.login(this.username, this.password);

    if (ok) {
      await this.router.navigateByUrl('/home');
    } else {
      this.error = 'Identifiants invalides.';
    }

    this.loading = false;
  }

  back(): void {
    this.router.navigateByUrl('/signin');
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