import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { StackItem } from '../../core/models';
import { IconComponent } from '../../shared/icon.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, IconComponent, RevealDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  api = inject(ApiService);

  /** Stack items grouped by category, preserving category order of first appearance. */
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
}
