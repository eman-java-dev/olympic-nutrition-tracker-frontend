import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang';
@Component({
    selector: 'app-home',
    imports: [RouterLink],
    templateUrl: './home.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './home.css'
})
export class HomeComponent {
  lang = inject(LangService);
  t = (k:string)=>this.lang.t(k);
}
