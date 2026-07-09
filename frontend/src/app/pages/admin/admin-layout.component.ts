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
          <a routerLink="messages" routerLinkActive="is-active">Inbox</a>
          <a routerLink="settings" routerLinkActive="is-active">Site content</a>
          <a routerLink="projects" routerLinkActive="is-active">Projects</a>
          <a routerLink="experiences" routerLinkActive="is-active">Experience</a>
          <a routerLink="stack" routerLinkActive="is-active">Tech stack</a>
          <a routerLink="values" routerLinkActive="is-active">Value props</a>
          <a href="#" (click)="logout($event)">Sign out</a>
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
