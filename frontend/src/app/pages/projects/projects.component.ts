import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-projects',
  imports: [AsyncPipe, RouterLink, RevealDirective],
  template: `
    <section class="section">
      <div class="container">
        <p class="section-eyebrow" appReveal>Featured Projects</p>
        <h1 class="section-title" appReveal>Selected enterprise work</h1>
        <p class="section-note" appReveal>
          Most of these projects were delivered in enterprise environments and are presented in an
          anonymized form for confidentiality reasons.
        </p>

        @if (api.content$ | async; as content) {
          <div class="projects-grid">
            @for (project of content.projects; track project.id) {
              <article class="project-card" appReveal>
                <header class="project-head">
                  <h3>{{ project.title }}</h3>
                  <span class="project-role">{{ project.role }}</span>
                </header>
                <p class="project-desc">{{ project.summary }}</p>
                <ul class="project-highlights">
                  @for (highlight of project.highlights; track $index) {
                    <li>{{ highlight }}</li>
                  }
                </ul>
                <ul class="tag-list project-tags">
                  @for (tag of project.tags; track tag) {
                    <li>{{ tag }}</li>
                  }
                </ul>
                <a class="project-link" [routerLink]="['/projects', project.slug]">Read more →</a>
              </article>
            }
          </div>
        } @else {
          <div class="loading-state">
            <div class="spinner" aria-hidden="true"></div>
            Loading…
          </div>
        }
      </div>
    </section>
  `,
})
export class ProjectsComponent {
  api = inject(ApiService);
}
