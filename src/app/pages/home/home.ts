import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);
}
