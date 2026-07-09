import { Component, inject, input, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  template: `
    @if (project(); as p) {
      <section class="detail-header">
        <div class="container">
          <a class="back-link" routerLink="/projects">← All projects</a>
          <p class="section-eyebrow">Project</p>
          <h1 class="section-title">{{ p.title }}</h1>
          <span class="project-role">{{ p.role }}</span>
        </div>
      </section>

      <section class="section" style="padding-top: 40px;">
        <div class="container">
          <p class="detail-context">{{ p.summary }}</p>

          @if (p.context) {
            <div class="detail-block">
              <h2>Context & contribution</h2>
              <p class="detail-context">{{ p.context }}</p>
            </div>
          }

          <div class="detail-block">
            <h2>Key achievements</h2>
            <ul class="project-highlights">
              @for (highlight of p.highlights; track $index) {
                <li>{{ highlight }}</li>
              }
            </ul>
          </div>

          <div class="detail-block">
            <h2>Technologies</h2>
            <ul class="tag-list">
              @for (tag of p.tags; track tag) {
                <li>{{ tag }}</li>
              }
            </ul>
          </div>

          <div class="detail-block" style="margin-top: 40px;">
            <a class="btn btn-primary" routerLink="/contact">Discuss a similar project</a>
          </div>
        </div>
      </section>
    } @else if (notFound()) {
      <div class="empty-state">
        <h1 class="section-title">Project not found</h1>
        <a class="btn btn-secondary" routerLink="/projects">Back to projects</a>
      </div>
    } @else {
      <div class="loading-state">
        <div class="spinner" aria-hidden="true"></div>
        Loading…
      </div>
    }
  `,
})
export class ProjectDetailComponent {
  /** Bound from the :slug route parameter (withComponentInputBinding). */
  slug = input.required<string>();

  private api = inject(ApiService);
  project = signal<Project | null>(null);
  notFound = signal(false);

  constructor() {
    effect(() => {
      const slug = this.slug();
      this.project.set(null);
      this.notFound.set(false);
      this.api.getProject(slug).subscribe({
        next: (project) => this.project.set(project),
        error: () => this.notFound.set(true),
      });
    });
  }
}
