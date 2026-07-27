import { ApplicationConfig, LOCALE_ID, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { detectInitialLang } from './core/language.service';
import { TranslocoHttpLoader } from './core/transloco.loader';

// French dates in the admin (DatePipe) — the public site renders no dates.
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // After a redeploy, lazy chunks referenced by an open tab no longer
      // exist — reload once to pick up the fresh index.html and bundles.
      withNavigationErrorHandler((error) => {
        const message = String((error as { error?: unknown }).error ?? error);
        const isStaleChunk =
          message.includes('Failed to fetch dynamically imported module') ||
          message.includes('ChunkLoadError') ||
          message.includes('error loading dynamically imported module');
        if (isStaleChunk && !sessionStorage.getItem('chunk_reload')) {
          sessionStorage.setItem('chunk_reload', '1');
          window.location.reload();
        } else if (!isStaleChunk) {
          sessionStorage.removeItem('chunk_reload');
        }
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'fr'],
        defaultLang: detectInitialLang(),
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
};
