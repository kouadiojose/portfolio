import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { LanguageService } from './language.service';

/** First-party page-view tracking: fire-and-forget, public pages only.
 *  The backend stores no PII (daily-salted visitor hash, no cookies). */
@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private language = inject(LanguageService);

  start(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = (event as NavigationEnd).urlAfterRedirects.split('?')[0].split('#')[0];
        if (path.startsWith('/admin')) return;
        this.http
          .post('/api/track', { path, language: this.language.lang() })
          .subscribe({ error: () => {} }); // analytics must never break the app
      });
  }
}
