import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LangService } from './services/lang';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  year = new Date().getFullYear();

  private langSvc = inject(LangService);
  auth = inject(AuthService);

  t = (k: string) => this.langSvc.t(k);
  current = computed(() => this.langSvc.lang());

  switch(l: 'en' | 'fr'): void {
    this.langSvc.setLang(l);
  }

  logout(): void {
    this.auth.logout();
  }
}