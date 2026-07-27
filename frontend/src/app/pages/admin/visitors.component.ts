import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

interface Visit {
  id: number;
  path: string;
  language: string;
  country: string;
  browser: string;
  os: string;
  device: string;
  referrer: string;
  created_at: string;
}

interface LabelCount {
  label: string;
  views: number;
  visitors: number;
}

interface VisitsSummary {
  views: number;
  visitors: number;
  countries: LabelCount[];
  browsers: LabelCount[];
  devices: LabelCount[];
  referrers: LabelCount[];
  languages: LabelCount[];
}

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Ordinateur',
  mobile: 'Mobile',
  tablet: 'Tablette',
  bot: 'Robot',
  other: 'Autre',
};

const PAGE_SIZE = 50;

/** Visitor details: countries, browsers, devices, referrers + recent visits.
 *  All data comes from our own first-party analytics — no third-party service,
 *  no cookies, no stored IP (the country is resolved locally at collection). */
@Component({
  selector: 'app-admin-visitors',
  imports: [DatePipe],
  template: `
    <h1>Visiteurs</h1>
    <p class="admin-sub">
      Qui visite le site, depuis quel pays et via quel canal — sur les 30 derniers jours.
      Aucune donnée personnelle n'est stockée : le pays est déduit de l'IP puis l'IP est jetée.
    </p>

    @if (summary(); as s) {
      <div class="stat-grid">
        <div class="stat-tile hue-indigo">
          <div class="stat-value">{{ s.views }}</div>
          <div class="stat-label">Vues (30 jours)</div>
        </div>
        <div class="stat-tile hue-cyan">
          <div class="stat-value">{{ s.visitors }}</div>
          <div class="stat-label">Visiteurs uniques (30 jours)</div>
        </div>
        <div class="stat-tile hue-emerald">
          <div class="stat-value">{{ s.countries.length }}</div>
          <div class="stat-label">Pays différents</div>
        </div>
        <div class="stat-tile hue-violet">
          <div class="stat-value">{{ humanShare(s) }}%</div>
          <div class="stat-label">Trafic humain (hors robots)</div>
        </div>
      </div>

      <div class="visit-panels">
        <div class="admin-panel">
          <h2>Pays</h2>
          @if (!s.countries.length) {
            <p class="visit-empty">Pas encore de données de pays.</p>
          }
          <div class="lc-list">
            @for (c of s.countries; track c.label) {
              <div class="lc-row">
                <span class="lc-flag">{{ flag(c.label) }}</span>
                <span class="lc-label">{{ countryName(c.label) }}</span>
                <span class="lc-bar-wrap"><span class="lc-bar" [style.width.%]="pct(c, s.countries)"></span></span>
                <span class="lc-count" [title]="c.visitors + ' visiteur(s)'">{{ c.views }}</span>
              </div>
            }
          </div>
        </div>

        <div class="admin-panel">
          <h2>Provenance</h2>
          @if (!s.referrers.length) {
            <p class="visit-empty">Accès directs uniquement pour l'instant (aucun site référent).</p>
          }
          <div class="lc-list">
            @for (r of s.referrers; track r.label) {
              <div class="lc-row">
                <span class="lc-label lc-mono">{{ r.label }}</span>
                <span class="lc-bar-wrap"><span class="lc-bar" [style.width.%]="pct(r, s.referrers)"></span></span>
                <span class="lc-count">{{ r.views }}</span>
              </div>
            }
          </div>
          <h2 style="margin-top: 22px;">Langues</h2>
          <div class="lc-list">
            @for (l of s.languages; track l.label) {
              <div class="lc-row">
                <span class="lc-label">{{ l.label === 'fr' ? 'Français' : 'Anglais' }}</span>
                <span class="lc-bar-wrap"><span class="lc-bar" [style.width.%]="pct(l, s.languages)"></span></span>
                <span class="lc-count">{{ l.views }}</span>
              </div>
            }
          </div>
        </div>

        <div class="admin-panel">
          <h2>Navigateurs</h2>
          <div class="lc-list">
            @for (b of s.browsers; track b.label) {
              <div class="lc-row">
                <span class="lc-label">{{ b.label }}</span>
                <span class="lc-bar-wrap"><span class="lc-bar" [style.width.%]="pct(b, s.browsers)"></span></span>
                <span class="lc-count">{{ b.views }}</span>
              </div>
            }
          </div>
          <h2 style="margin-top: 22px;">Appareils</h2>
          <div class="lc-list">
            @for (d of s.devices; track d.label) {
              <div class="lc-row">
                <span class="lc-label">{{ deviceLabel(d.label) }}</span>
                <span class="lc-bar-wrap"><span class="lc-bar" [style.width.%]="pct(d, s.devices)"></span></span>
                <span class="lc-count">{{ d.views }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <div class="admin-panel">
      <h2>Dernières visites</h2>
      @if (visits(); as list) {
        @if (!list.length) {
          <p class="visit-empty">Aucune visite enregistrée pour l'instant.</p>
        } @else {
          <div class="visit-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th><th>Page</th><th>Pays</th><th>Navigateur</th>
                  <th>Système</th><th>Appareil</th><th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                @for (v of list; track v.id) {
                  <tr>
                    <td class="visit-date">{{ v.created_at | date: 'd MMM, HH:mm' }}</td>
                    <td><code class="visit-path">{{ v.path }}</code></td>
                    <td>
                      @if (v.country) {
                        <span class="lc-flag">{{ flag(v.country) }}</span> {{ countryName(v.country) }}
                      } @else {
                        <span class="visit-unknown">—</span>
                      }
                    </td>
                    <td>{{ v.browser || '—' }}</td>
                    <td>{{ v.os || '—' }}</td>
                    <td>
                      <span class="badge" [class.badge-bot]="v.device === 'bot'" [class.badge-lang]="v.device !== 'bot'">
                        {{ deviceLabel(v.device) }}
                      </span>
                    </td>
                    <td class="lc-mono">{{ v.referrer || 'direct' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (list.length < total()) {
            <button class="btn btn-secondary btn-sm" style="margin-top: 14px;" (click)="loadMore()" [disabled]="loadingMore()">
              {{ loadingMore() ? 'Chargement…' : 'Charger plus (' + (total() - list.length) + ' restantes)' }}
            </button>
          }
        }
      } @else {
        <div class="loading-state"><div class="spinner"></div>Chargement…</div>
      }
    </div>

    <p class="visit-attribution">
      Analytics 100 % maison, sans cookies ni service tiers.
      <a href="https://db-ip.com" target="_blank" rel="noopener">Géolocalisation IP par DB-IP</a>.
    </p>
  `,
})
export class VisitorsComponent {
  private http = inject(HttpClient);

  summary = signal<VisitsSummary | null>(null);
  visits = signal<Visit[] | null>(null);
  total = signal(0);
  loadingMore = signal(false);

  private countryNames = new Intl.DisplayNames(['fr'], { type: 'region' });

  constructor() {
    this.http
      .get<VisitsSummary>('/api/admin/visits/summary')
      .subscribe((s) => this.summary.set(s));
    this.fetchPage(0);
  }

  private fetchPage(offset: number): void {
    this.http
      .get<{ items: Visit[]; total: number }>(`/api/admin/visits?limit=${PAGE_SIZE}&offset=${offset}`)
      .subscribe((page) => {
        this.visits.update((list) => [...(list ?? []), ...page.items]);
        this.total.set(page.total);
        this.loadingMore.set(false);
      });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.fetchPage(this.visits()?.length ?? 0);
  }

  flag(code: string): string {
    if (!/^[A-Z]{2}$/i.test(code)) return '🌐';
    const base = 0x1f1e6;
    const upper = code.toUpperCase();
    return String.fromCodePoint(
      base + upper.charCodeAt(0) - 65,
      base + upper.charCodeAt(1) - 65
    );
  }

  countryName(code: string): string {
    try {
      return this.countryNames.of(code.toUpperCase()) ?? code;
    } catch {
      return code;
    }
  }

  deviceLabel(device: string): string {
    return DEVICE_LABELS[device] ?? (device || '—');
  }

  pct(item: LabelCount, list: LabelCount[]): number {
    const max = Math.max(...list.map((x) => x.views), 1);
    return Math.max(6, Math.round((item.views / max) * 100));
  }

  humanShare(s: VisitsSummary): number {
    if (!s.views) return 100;
    const bots = s.devices.find((d) => d.label === 'bot')?.views ?? 0;
    return Math.round(((s.views - bots) / s.views) * 100);
  }
}
