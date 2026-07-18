import { Component, effect, inject, input, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { ApiService } from '../../core/api.service';
import { LanguageService } from '../../core/language.service';
import { Project } from '../../core/models';
import { CaseMockComponent } from '../../shared/case-mock.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-case-study',
  imports: [RouterLink, TranslocoPipe, CaseMockComponent, RevealDirective],
  template: `
    @if (project(); as p) {
      <section class="cs-hero">
        <div class="container">
          <a class="back-link" [routerLink]="['/', language.lang()]" fragment="work">
            ← {{ 'caseStudy.back' | transloco }}</a>
          <span class="work-role">{{ p.role }}</span>
          <h1 class="cs-title">{{ p.title }}</h1>
          <div class="cs-meta">
            @for (tag of p.tags; track tag) {
              <span class="chip">{{ tag }}</span>
            }
          </div>
          <p class="cs-summary">{{ p.summary }}</p>
        </div>
      </section>

      <section class="cs-body">
        <div class="container">
          <app-case-mock [kind]="p.visual" [url]="mockUrl(p)" [caption]="p.title" />

          <div class="cs-grid">
            <div class="cs-block" appReveal>
              <h2>{{ 'caseStudy.context' | transloco }}</h2>
              <p>{{ p.context }}</p>
            </div>
            <div class="cs-block" appReveal>
              <h2>{{ 'caseStudy.problem' | transloco }}</h2>
              <p>{{ p.problem }}</p>
            </div>

            <div class="cs-block cs-block-wide" appReveal>
              <h2>{{ 'caseStudy.approach' | transloco }}</h2>
              <p>{{ p.approach }}</p>
            </div>

            <div class="cs-block" appReveal>
              <h2>{{ 'caseStudy.contributions' | transloco }}</h2>
              <ul>
                @for (contribution of p.contributions; track $index) {
                  <li>{{ contribution }}</li>
                }
              </ul>
            </div>
            <div class="cs-block" appReveal>
              <h2>{{ 'caseStudy.role' | transloco }}</h2>
              <p>{{ p.role }}</p>
              <h2 style="margin-top: 18px;">{{ 'caseStudy.technologies' | transloco }}</h2>
              <div class="chip-row" style="margin-top: 0;">
                @for (tag of p.tags; track tag) {
                  <span class="chip">{{ tag }}</span>
                }
              </div>
            </div>

            <div class="cs-block cs-block-wide cs-learnings" appReveal>
              <h2>{{ 'caseStudy.learnings' | transloco }}</h2>
              <p>{{ p.learnings }}</p>
            </div>
          </div>

          <div class="cs-cta" appReveal>
            <a class="btn btn-primary" [routerLink]="['/', language.lang(), 'contact']">
              {{ 'caseStudy.discuss' | transloco }}</a>
          </div>
        </div>
      </section>
    } @else if (notFound()) {
      <div class="empty-state">
        <h1 class="section-title" style="margin-bottom: 22px;">{{ 'caseStudy.notFound' | transloco }}</h1>
        <a class="btn btn-outline" [routerLink]="['/', language.lang()]" fragment="work">
          {{ 'caseStudy.backToWork' | transloco }}</a>
      </div>
    } @else {
      <div class="loading-state">
        <div class="spinner" aria-hidden="true"></div>
      </div>
    }
  `,
})
export class CaseStudyComponent {
  /** Bound from the :slug route parameter (withComponentInputBinding). */
  slug = input.required<string>();

  language = inject(LanguageService);
  private api = inject(ApiService);
  private title = inject(Title);
  private meta = inject(Meta);

  project = signal<Project | null>(null);
  notFound = signal(false);

  /** Plausible, honest address bar per project (public URLs when they exist). */
  mockUrl(p: Project): string {
    const urls: Record<string, string> = {
      'gisabo-money-transfer': 'gisabogroup.ca — production',
      'hopefund-microfinance-platform': 'hopefund — core banking',
      'observability-monitoring-platform': 'observability — internal',
      'odoo-business-process-automation': 'api console — integration',
    };
    return urls[p.slug] ?? 'app.internal — production';
  }

  constructor() {
    // Reload when the slug or the language changes (no page refresh)
    effect(() => {
      const slug = this.slug();
      this.language.lang(); // track language changes
      this.load(slug);
    });
  }

  private load(slug: string): void {
    this.notFound.set(false);
    this.api.getProject(slug).subscribe({
      next: (project) => {
        this.project.set(project);
        const pageTitle = `${project.title} — Yeo Yedjande`;
        this.title.setTitle(pageTitle);
        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({ name: 'description', content: project.summary });
        this.meta.updateTag({ property: 'og:description', content: project.summary });
      },
      error: () => {
        this.project.set(null);
        this.notFound.set(true);
      },
    });
  }
}
