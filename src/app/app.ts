import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LangService } from './services/lang';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  year = new Date().getFullYear();
  private langSvc = inject(LangService);

  t = (k: string) => this.langSvc.t(k);
  current = computed(() => this.langSvc.lang());
  switch(l: 'en'|'fr') { this.langSvc.setLang(l); }
}
