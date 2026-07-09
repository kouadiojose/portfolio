import { Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = 'portfolio_lang';

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

  /** Activate a language (Transloco + storage + <html lang>). No page reload. */
  use(lang: Lang): void {
    this.lang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  /** Switch language in place: same route, other URL prefix. */
  switchTo(lang: Lang): void {
    if (lang === this.lang()) return;
    const rest = this.router.url.replace(/^\/(en|fr)(?=\/|$)/, '');
    this.use(lang);
    this.router.navigateByUrl(`/${lang}${rest || ''}`);
  }

  private metaSubs: { unsubscribe(): void }[] = [];

  /** Update the document title + meta description for the current page.
   *  Stays in sync when the language changes (selectTranslate re-emits). */
  setPageMeta(titleKey: string, descriptionKey?: string): void {
    this.metaSubs.forEach((s) => s.unsubscribe());
    this.metaSubs = [
      this.transloco
        .selectTranslate(titleKey)
        .subscribe((value: string) => this.title.setTitle(value)),
    ];
    if (descriptionKey) {
      this.metaSubs.push(
        this.transloco
          .selectTranslate(descriptionKey)
          .subscribe((value: string) =>
            this.meta.updateTag({ name: 'description', content: value })
          )
      );
    }
  }
}
