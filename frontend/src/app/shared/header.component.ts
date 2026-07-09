import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { LanguageService } from '../core/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <header class="site-header">
      <nav class="nav container" aria-label="Main navigation">
        <a class="nav-brand" [routerLink]="['/', language.lang()]" (click)="close()">
          <span class="brand-mark" aria-hidden="true">YY</span>
          <span class="brand-name">Yeo&nbsp;Yedjande</span>
        </a>

        <div class="nav-right">
          <div class="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              [class.is-active]="language.lang() === 'en'"
              (click)="language.switchTo('en')"
            >EN</button>
            <button
              type="button"
              [class.is-active]="language.lang() === 'fr'"
              (click)="language.switchTo('fr')"
            >FR</button>
          </div>

          <button
            class="nav-toggle"
            aria-label="Toggle menu"
            [attr.aria-expanded]="open()"
            (click)="open.set(!open())"
          >
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
          </button>

          <ul class="nav-menu" [class.is-open]="open()">
            <li>
              <a [routerLink]="['/', language.lang()]" [routerLinkActiveOptions]="{ exact: true }"
                 routerLinkActive="is-active" (click)="close()">{{ 'nav.home' | transloco }}</a>
            </li>
            <li>
              <a [routerLink]="['/', language.lang()]" fragment="work" (click)="close()">
                {{ 'nav.work' | transloco }}</a>
            </li>
            <li>
              <a [routerLink]="['/', language.lang(), 'contact']" class="nav-cta" (click)="close()">
                {{ 'nav.contact' | transloco }}</a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  language = inject(LanguageService);
  open = signal(false);

  close(): void {
    this.open.set(false);
  }
}
