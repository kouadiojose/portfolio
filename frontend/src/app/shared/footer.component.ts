import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, TranslocoPipe],
  template: `
    <footer class="site-footer">
      <div class="container footer-inner">
        @if (api.content$ | async; as content) {
          <p>© {{ year }} {{ content.settings.full_name }}</p>
          <p class="footer-links">
            <a [href]="'mailto:' + content.settings.email">Email</a>
            <a [href]="content.settings.linkedin_url" target="_blank" rel="noopener">LinkedIn</a>
            <a [href]="content.settings.github_url" target="_blank" rel="noopener">GitHub</a>
          </p>
        }
        <p class="footer-colophon">{{ 'footer.poweredBy' | transloco }}</p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  api = inject(ApiService);
  year = new Date().getFullYear();
}
