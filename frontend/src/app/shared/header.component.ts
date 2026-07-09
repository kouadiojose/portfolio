import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <nav class="nav container" aria-label="Main navigation">
        <a class="nav-brand" routerLink="/" (click)="close()">
          <span class="brand-mark" aria-hidden="true">YY</span>
          <span class="brand-name">Yeo&nbsp;Yedjande</span>
        </a>

        <button
          class="nav-toggle"
          aria-label="Toggle menu"
          [attr.aria-expanded]="open()"
          (click)="open.set(!open())"
        >
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
        </button>

        <ul class="nav-menu" [class.is-open]="open()">
          <li><a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="is-active" (click)="close()">Home</a></li>
          <li><a routerLink="/projects" routerLinkActive="is-active" (click)="close()">Projects</a></li>
          @if (auth.isLoggedIn()) {
            <li><a routerLink="/admin" routerLinkActive="is-active" (click)="close()">Admin</a></li>
          }
          <li><a routerLink="/contact" class="nav-cta" (click)="close()">Contact</a></li>
        </ul>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  auth = inject(AuthService);
  open = signal(false);

  close(): void {
    this.open.set(false);
  }
}
