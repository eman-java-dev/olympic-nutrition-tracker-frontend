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
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);
  current = computed(()=>this.lang.lang());
  switch(l:'en'|'fr'){ this.lang.setLang(l); }
}
