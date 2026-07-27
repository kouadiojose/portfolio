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
  visits: {
    today_views: number;
    today_visitors: number;
    week_views: number;
    week_visitors: number;
    total_views: number;
    daily: { date: string; views: number; visitors: number }[];
    top_pages: { path: string; views: number }[];
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
    <h1>Tableau de bord</h1>
    <p class="admin-sub">L'essentiel en un coup d'œil.</p>

    @if (stats(); as s) {
      <div class="stat-grid">
        <div class="stat-tile hue-cyan">
          <span class="stat-number">{{ s.visits.today_visitors }}</span>
          <span class="stat-label">Visiteur{{ s.visits.today_visitors === 1 ? '' : 's' }} aujourd'hui</span>
          <span class="stat-sub">{{ s.visits.week_visitors }} cette semaine · {{ s.visits.total_views }} vues au total</span>
        </div>
        <a class="stat-tile hue-indigo" routerLink="/admin/messages">
          <span class="stat-number">{{ s.messages.unread }}</span>
          <span class="stat-label">Message{{ s.messages.unread === 1 ? '' : 's' }} non lu{{ s.messages.unread === 1 ? '' : 's' }}</span>
          <span class="stat-sub">{{ s.messages.total }} au total · {{ s.messages.french }} FR / {{ s.messages.english }} EN</span>
        </a>
        <a class="stat-tile hue-violet" routerLink="/admin/projects">
          <span class="stat-number">{{ s.projects.visible }}</span>
          <span class="stat-label">Projets visibles</span>
          <span class="stat-sub">{{ s.projects.total }} en base</span>
        </a>
        <a class="stat-tile hue-rose" routerLink="/admin/experiences">
          <span class="stat-number">{{ s.experiences }}</span>
          <span class="stat-label">Expériences</span>
          <span class="stat-sub">{{ s.stack_items }} éléments de stack · {{ s.values }} atouts</span>
        </a>
        <a class="stat-tile" [class.hue-emerald]="gapTotal(s) === 0" [class.hue-amber]="gapTotal(s) > 0"
           routerLink="/admin/settings">
          <span class="stat-number">{{ gapTotal(s) === 0 ? '100%' : gapTotal(s) }}</span>
          <span class="stat-label">{{ gapTotal(s) === 0 ? 'Couverture bilingue' : 'Traductions FR manquantes' }}</span>
          <span class="stat-sub">
            @if (gapTotal(s) === 0) {
              Tous les textes existent en FR et EN
            } @else {
              {{ gapDetail(s) }}
            }
          </span>
        </a>
      </div>

      <div class="admin-panel">
        <h2>Audience — 7 derniers jours</h2>
        <div class="audience-grid">
          <div class="audience-chart" aria-label="Daily views">
            @for (day of s.visits.daily; track day.date) {
              <div class="audience-col">
                <div class="audience-bar-wrap">
                  <div class="audience-bar" [style.height.%]="barHeight(day.views, s)"
                       [title]="day.views + ' vues · ' + day.visitors + ' visiteurs'"></div>
                </div>
                <span class="audience-day">{{ day.date.slice(5) }}</span>
                <span class="audience-count">{{ day.views }}</span>
              </div>
            }
          </div>
          <div>
            <h3 class="audience-subtitle">Pages les plus vues (30 jours)</h3>
            @if (!s.visits.top_pages.length) {
              <p style="color: var(--text-3); font-size: 13.5px;">Aucune visite enregistrée pour l'instant.</p>
            }
            <ul class="audience-pages">
              @for (pageStat of s.visits.top_pages; track pageStat.path) {
                <li><code>{{ pageStat.path }}</code><span>{{ pageStat.views }}</span></li>
              }
            </ul>
          </div>
        </div>
      </div>

      <div class="dash-columns">
        <div>
          <div class="admin-panel">
            <h2>Derniers messages</h2>
            @if (!s.latest_messages.length) {
              <p style="color: var(--text-3); font-size: 14px;">Aucun message pour l'instant — ils apparaîtront ici dès qu'un recruteur vous écrira.</p>
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
                      <span class="badge badge-new">Nouveau</span>
                    }
                    <span class="message-meta"> {{ message.created_at | date: 'd MMM, HH:mm' }}</span>
                  </div>
                </div>
                @if (message.subject) {
                  <div style="font-size: 13.5px; font-weight: 620;">{{ message.subject }}</div>
                }
                <p class="dash-message-body">{{ message.body }}</p>
              </div>
            }
            @if (s.latest_messages.length) {
              <a class="btn btn-outline btn-sm" routerLink="/admin/messages">Ouvrir la boîte de réception →</a>
            }
          </div>
        </div>

        <div>
          <div class="admin-panel">
            <h2>Actions rapides</h2>
            <div class="dash-actions">
              <a class="btn btn-outline" routerLink="/admin/projects">+ Nouveau projet</a>
              <a class="btn btn-outline" routerLink="/admin/settings">Modifier le contenu</a>
              <a class="btn btn-outline" routerLink="/admin/account">Gérer le compte</a>
              <a class="btn btn-primary" href="/fr" target="_blank" rel="noopener">Voir le site public ↗</a>
            </div>
          </div>

          <div class="admin-panel">
            <h2>Santé du contenu</h2>
            <ul class="dash-health">
              <li>
                <span [class.dot-ok]="s.projects.visible >= 4" [class.dot-warn]="s.projects.visible < 4" class="dot"></span>
                {{ s.projects.visible }} projets visibles (4–5 recommandés)
              </li>
              <li>
                <span [class.dot-ok]="gapTotal(s) === 0" [class.dot-warn]="gapTotal(s) > 0" class="dot"></span>
                @if (gapTotal(s) === 0) { Tout le contenu est traduit } @else { {{ gapTotal(s) }} champs sans traduction FR }
              </li>
              <li>
                <span [class.dot-ok]="s.messages.unread === 0" [class.dot-warn]="s.messages.unread > 0" class="dot"></span>
                @if (s.messages.unread === 0) { Boîte de réception à jour } @else { {{ s.messages.unread }} message(s) en attente de réponse }
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

  barHeight(views: number, s: AdminStats): number {
    const max = Math.max(...s.visits.daily.map((d) => d.views), 1);
    return Math.max((views / max) * 100, views > 0 ? 6 : 2);
  }

  gapTotal(s: AdminStats): number {
    const g = s.translation_gaps;
    return g.settings + g.projects + g.experiences + g.values + g.stack;
  }

  gapDetail(s: AdminStats): string {
    const g = s.translation_gaps;
    const parts: string[] = [];
    if (g.settings) parts.push(`${g.settings} textes du site`);
    if (g.projects) parts.push(`${g.projects} champs de projets`);
    if (g.experiences) parts.push(`${g.experiences} champs d'expériences`);
    if (g.values) parts.push(`${g.values} atouts`);
    if (g.stack) parts.push(`${g.stack} catégories de stack`);
    return parts.join(' · ');
  }
}
