import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  // ✅ أضفنا CommonModule هنا لحل تحذير ngIf/ngIfElse
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [
    trigger('routeAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('260ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('180ms ease', style({ opacity: 0, transform: 'translateY(6px)' }))
      ])
    ])
  ]
})
export class AppComponent {
  constructor(private router: Router) {}

  isHome(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/' || url === '/home';
  }
}
