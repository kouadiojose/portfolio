import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { map } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { LanguageService } from '../../core/language.service';
import { StackItem } from '../../core/models';
import { HeroVisualComponent } from '../../shared/hero-visual.component';
import { ProjectVisualComponent } from '../../shared/project-visual.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    RouterLink,
    TranslocoPipe,
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
}
