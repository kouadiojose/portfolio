import { Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs';

export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = 'portfolio_lang';
const SITE_URL = 'https://yeoyedjande.com';

export function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (LANGS as readonly string[]).includes(stored)) return stored as Lang;
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return (LANGS as readonly string[]).includes(browser) ? (browser as Lang) : 'en';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);
  private router = inject(Router);
  private title = inject(Title);
  private meta = inject(Meta);

  readonly lang = signal<Lang>(detectInitialLang());

  constructor() {
    // Apply the detected language's side effects (<html lang>, og:locale)
    // on startup — the lang guard only calls use() on changes.
    this.use(this.lang());
    // Keep canonical / hreflang / og:url in sync with every navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateSeoLinks());
  }

  /** Activate a language (Transloco + storage + <html lang>). No page reload. */
  use(lang: Lang): void {
    this.lang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    this.meta.updateTag({
      property: 'og:locale',
      content: lang === 'fr' ? 'fr_FR' : 'en_US',
    });
  }

  /** Switch language in place: same route, other URL prefix. */
  switchTo(lang: Lang): void {
    if (lang === this.lang()) return;
    const rest = this.router.url.replace(/^\/(en|fr)(?=\/|$)/, '');
    this.use(lang);
    this.router.navigateByUrl(`/${lang}${rest || ''}`);
  }

  private metaSubs: { unsubscribe(): void }[] = [];

  /** Update the document title, meta description and Open Graph tags for the
   *  current page. Stays in sync when the language changes. */
  setPageMeta(titleKey: string, descriptionKey?: string): void {
    this.metaSubs.forEach((sub) => sub.unsubscribe());
    this.metaSubs = [
      this.transloco.selectTranslate(titleKey).subscribe((value: string) => {
        this.title.setTitle(value);
        this.meta.updateTag({ property: 'og:title', content: value });
      }),
    ];
    if (descriptionKey) {
      this.metaSubs.push(
        this.transloco.selectTranslate(descriptionKey).subscribe((value: string) => {
          this.meta.updateTag({ name: 'description', content: value });
          this.meta.updateTag({ property: 'og:description', content: value });
        })
      );
    }
  }

  /** Canonical + hreflang alternates + og:url for the current route. */
  private updateSeoLinks(): void {
    const path = this.router.url.split('#')[0].split('?')[0];
    const rest = path.replace(/^\/(en|fr)(?=\/|$)/, '');
    this.setLinkTag('canonical', undefined, `${SITE_URL}${path}`);
    this.setLinkTag('alternate', 'en', `${SITE_URL}/en${rest}`);
    this.setLinkTag('alternate', 'fr', `${SITE_URL}/fr${rest}`);
    this.setLinkTag('alternate', 'x-default', `${SITE_URL}/en${rest}`);
    this.meta.updateTag({ property: 'og:url', content: `${SITE_URL}${path}` });
  }

  private setLinkTag(rel: string, hreflang: string | undefined, href: string): void {
    const selector = hreflang
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`;
    let link = document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      if (hreflang) link.hreflang = hreflang;
      document.head.appendChild(link);
    }
    link.href = href;
  }
}
