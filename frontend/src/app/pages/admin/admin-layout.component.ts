import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <nav>
          <a routerLink="dashboard" routerLinkActive="is-active">Tableau de bord</a>
          <a routerLink="visitors" routerLinkActive="is-active">Visiteurs</a>
          <a routerLink="messages" routerLinkActive="is-active">Boîte de réception</a>
          <a routerLink="settings" routerLinkActive="is-active">Contenu du site</a>
          <a routerLink="projects" routerLinkActive="is-active">Projets</a>
          <a routerLink="experiences" routerLinkActive="is-active">Expériences</a>
          <a routerLink="stack" routerLinkActive="is-active">Stack technique</a>
          <a routerLink="values" routerLinkActive="is-active">Atouts</a>
          <a routerLink="account" routerLinkActive="is-active">Compte</a>
          <a href="#" (click)="logout($event)">Déconnexion</a>
        </nav>
      </aside>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);

  logout(event: Event): void {
    event.preventDefault();
    this.auth.logout();
  }
}
