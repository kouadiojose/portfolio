import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer-inner">
        @if (api.content$ | async; as content) {
          <p>© {{ year }} {{ content.settings.full_name }} — {{ content.settings.headline }}</p>
          <p class="footer-links">
            <a [href]="'mailto:' + content.settings.email">Email</a>
            <a [href]="content.settings.linkedin_url" target="_blank" rel="noopener">LinkedIn</a>
            <a [href]="content.settings.github_url" target="_blank" rel="noopener">GitHub</a>
            <a routerLink="/admin">Admin</a>
          </p>
        }
        <p class="footer-colophon">
          This portfolio is itself a full-stack application — Angular frontend, FastAPI REST API,
          PostgreSQL database, JWT-secured admin, shipped with Docker.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  api = inject(ApiService);
  year = new Date().getFullYear();
}
