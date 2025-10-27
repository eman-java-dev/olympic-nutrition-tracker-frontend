import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang';
@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],        
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);
}
