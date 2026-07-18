import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AdminStats {
  messages: { total: number; unread: number; french: number; english: number };
  projects: { total: number; visible: number };
  experiences: number;
  stack_items: number;
  values: number;
  translation_gaps: {
    settings: number;
    projects: number;
    experiences: number;
    values: number;
    stack: number;
  };
  latest_messages: {
    id: number;
    name: string;
    email: string;
    subject: string;
    body: string;
    language: string;
    created_at: string;
    read: boolean;
  }[];
}

/** Admin landing page: key numbers, latest messages, quick actions. */
@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, RouterLink],
  template: `
    <h1>Dashboard</h1>
    <p class="admin-sub">Everything at a glance.</p>

    @if (stats(); as s) {
      <div class="stat-grid">
        <a class="stat-tile hue-indigo" routerLink="/admin/messages">
          <span class="stat-number">{{ s.messages.unread }}</span>
          <span class="stat-label">Unread message{{ s.messages.unread === 1 ? '' : 's' }}</span>
          <span class="stat-sub">{{ s.messages.total }} total · {{ s.messages.french }} FR / {{ s.messages.english }} EN</span>
        </a>
        <a class="stat-tile hue-violet" routerLink="/admin/projects">
          <span class="stat-number">{{ s.projects.visible }}</span>
          <span class="stat-label">Visible projects</span>
          <span class="stat-sub">{{ s.projects.total }} in database</span>
        </a>
        <a class="stat-tile hue-cyan" routerLink="/admin/experiences">
          <span class="stat-number">{{ s.experiences }}</span>
          <span class="stat-label">Experience entries</span>
          <span class="stat-sub">{{ s.stack_items }} stack items · {{ s.values }} value props</span>
        </a>
        <a class="stat-tile" [class.hue-emerald]="gapTotal(s) === 0" [class.hue-amber]="gapTotal(s) > 0"
           routerLink="/admin/settings">
          <span class="stat-number">{{ gapTotal(s) === 0 ? '100%' : gapTotal(s) }}</span>
          <span class="stat-label">{{ gapTotal(s) === 0 ? 'Bilingual coverage' : 'Missing FR translations' }}</span>
          <span class="stat-sub">
            @if (gapTotal(s) === 0) {
              Every text exists in EN and FR
            } @else {
              {{ gapDetail(s) }}
            }
          </span>
        </a>
      </div>

      <div class="dash-columns">
        <div>
          <div class="admin-panel">
            <h2>Latest messages</h2>
            @if (!s.latest_messages.length) {
              <p style="color: var(--text-3); font-size: 14px;">No messages yet — they will appear here as recruiters reach out.</p>
            }
            @for (message of s.latest_messages; track message.id) {
              <div class="dash-message">
                <div class="message-head">
                  <div>
                    <strong>{{ message.name }}</strong>
                    <span class="message-meta"> · {{ message.email }}</span>
                  </div>
                  <div>
                    <span class="badge badge-lang">{{ message.language === 'fr' ? 'FR' : 'EN' }}</span>
                    @if (!message.read) {
                      <span class="badge badge-new">New</span>
                    }
                    <span class="message-meta"> {{ message.created_at | date: 'MMM d, HH:mm' }}</span>
                  </div>
                </div>
                @if (message.subject) {
                  <div style="font-size: 13.5px; font-weight: 620;">{{ message.subject }}</div>
                }
                <p class="dash-message-body">{{ message.body }}</p>
              </div>
            }
            @if (s.latest_messages.length) {
              <a class="btn btn-outline btn-sm" routerLink="/admin/messages">Open inbox →</a>
            }
          </div>
        </div>

        <div>
          <div class="admin-panel">
            <h2>Quick actions</h2>
            <div class="dash-actions">
              <a class="btn btn-outline" routerLink="/admin/projects">+ New project</a>
              <a class="btn btn-outline" routerLink="/admin/settings">Edit site content</a>
              <a class="btn btn-outline" routerLink="/admin/account">Manage account</a>
              <a class="btn btn-primary" href="/fr" target="_blank" rel="noopener">View public site ↗</a>
            </div>
          </div>

          <div class="admin-panel">
            <h2>Content health</h2>
            <ul class="dash-health">
              <li>
                <span [class.dot-ok]="s.projects.visible >= 4" [class.dot-warn]="s.projects.visible < 4" class="dot"></span>
                {{ s.projects.visible }} projects visible (4–5 recommended)
              </li>
              <li>
                <span [class.dot-ok]="gapTotal(s) === 0" [class.dot-warn]="gapTotal(s) > 0" class="dot"></span>
                @if (gapTotal(s) === 0) { All content translated } @else { {{ gapTotal(s) }} fields missing French }
              </li>
              <li>
                <span [class.dot-ok]="s.messages.unread === 0" [class.dot-warn]="s.messages.unread > 0" class="dot"></span>
                @if (s.messages.unread === 0) { Inbox is clear } @else { {{ s.messages.unread }} message(s) awaiting reply }
              </li>
            </ul>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-state"><div class="spinner"></div></div>
    }
  `,
})
export class DashboardComponent {
  private http = inject(HttpClient);

  stats = signal<AdminStats | null>(null);

  constructor() {
    this.http.get<AdminStats>('/api/admin/stats').subscribe((s) => this.stats.set(s));
  }

  gapTotal(s: AdminStats): number {
    const g = s.translation_gaps;
    return g.settings + g.projects + g.experiences + g.values + g.stack;
  }

  gapDetail(s: AdminStats): string {
    const g = s.translation_gaps;
    const parts: string[] = [];
    if (g.settings) parts.push(`${g.settings} site texts`);
    if (g.projects) parts.push(`${g.projects} project fields`);
    if (g.experiences) parts.push(`${g.experiences} experience fields`);
    if (g.values) parts.push(`${g.values} value props`);
    if (g.stack) parts.push(`${g.stack} stack categories`);
    return parts.join(' · ');
  }
}
