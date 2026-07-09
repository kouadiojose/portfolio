import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ContactMessage,
  Experience,
  ExpertiseItem,
  Project,
  SiteSettings,
  StackItem,
  ValueProp,
} from './models';

/** Authenticated API used by the admin dashboard. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private http = inject(HttpClient);
  private base = '/api/admin';

  // Site settings
  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.base}/settings`);
  }
  updateSettings(payload: Partial<SiteSettings>): Observable<SiteSettings> {
    return this.http.put<SiteSettings>(`${this.base}/settings`, payload);
  }

  // Generic CRUD (entity name maps to the API path)
  list<T>(entity: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${entity}`);
  }
  create<T>(entity: string, payload: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${entity}`, payload);
  }
  update<T>(entity: string, id: number, payload: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${entity}/${id}`, payload);
  }
  delete(entity: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${entity}/${id}`);
  }

  // Typed conveniences
  listProjects() { return this.list<Project>('projects'); }
  listExpertise() { return this.list<ExpertiseItem>('expertise'); }
  listStack() { return this.list<StackItem>('stack'); }
  listExperiences() { return this.list<Experience>('experiences'); }
  listValues() { return this.list<ValueProp>('values'); }

  // Messages inbox
  listMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.base}/messages`);
  }
  markRead(id: number): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.base}/messages/${id}/read`, {});
  }
  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${id}`);
  }
}
