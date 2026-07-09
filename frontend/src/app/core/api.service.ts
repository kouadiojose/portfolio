import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { ContactPayload, PortfolioContent, Project } from './models';

/** Public (unauthenticated) API. Content is cached for the session. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  /** One aggregated request for all public content, replayed to every subscriber. */
  readonly content$: Observable<PortfolioContent> = this.http
    .get<PortfolioContent>('/api/content')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getProject(slug: string): Observable<Project> {
    return this.http.get<Project>(`/api/projects/${slug}`);
  }

  sendMessage(payload: ContactPayload): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>('/api/contact', payload);
  }
}
