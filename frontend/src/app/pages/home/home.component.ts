import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { LanguageService } from '../../core/language.service';
import { StackItem } from '../../core/models';
import { CountUpDirective } from '../../shared/count-up.directive';
import { HeroVisualComponent } from '../../shared/hero-visual.component';
import { ProjectVisualComponent } from '../../shared/project-visual.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    RouterLink,
    TranslocoPipe,
    CountUpDirective,
    HeroVisualComponent,
    ProjectVisualComponent,
    RevealDirective,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  api = inject(ApiService);
  language = inject(LanguageService);

  /** Stack items grouped by category, preserving order of first appearance. */
  stackGroups$ = this.api.content$.pipe(
    map((content) => {
      const groups: { category: string; items: StackItem[] }[] = [];
      for (const item of content.stack) {
        let group = groups.find((g) => g.category === item.category);
        if (!group) {
          group = { category: item.category, items: [] };
          groups.push(group);
        }
        group.items.push(item);
      }
      return groups;
    })
  );

  constructor() {
    this.language.setPageMeta('meta.homeTitle', 'meta.homeDescription');
  }

  /** Split "8+ years of experience" into a big number ("8+") and a label. */
  impactParts(impact: string): { number: string | null; label: string } {
    const match = impact.match(/^(\d+[+%]?)\s+(.*)$/);
    return match ? { number: match[1], label: match[2] } : { number: null, label: impact };
  }

  orgInitial(organization: string): string {
    return (organization.trim()[0] ?? '•').toUpperCase();
  }
}
