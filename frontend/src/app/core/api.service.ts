import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, map, shareReplay, switchMap } from 'rxjs';

import { LanguageService } from './language.service';
import { ContactPayload, PortfolioContent, Project } from './models';

/** Public (unauthenticated) API. Content follows the active language and is
 *  cached per language for the session — switching languages never reloads
 *  the page, it just swaps the resolved content. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private language = inject(LanguageService);

  private cache = new Map<string, Observable<PortfolioContent>>();

  /** Re-emits whenever the active language changes. */
  readonly content$: Observable<PortfolioContent> = toObservable(this.language.lang).pipe(
    switchMap((lang) => this.contentFor(lang)),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  private contentFor(lang: string): Observable<PortfolioContent> {
    let cached = this.cache.get(lang);
    if (!cached) {
      cached = this.http
        .get<PortfolioContent>('/api/content', { params: { lang } })
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.cache.set(lang, cached);
    }
    return cached;
  }

  getProject(slug: string): Observable<Project> {
    return this.http.get<Project>(`/api/projects/${slug}`, {
      params: { lang: this.language.lang() },
    });
  }

  getContactChallenge(): Observable<string> {
    return this.http
      .get<{ token: string }>('/api/contact/challenge')
      .pipe(map((res) => res.token));
  }

  sendMessage(payload: ContactPayload, challenge: string): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>('/api/contact', {
      ...payload,
      language: this.language.lang(),
      challenge,
    });
  }
}
