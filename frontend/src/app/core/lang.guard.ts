import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { LANGS, Lang, LanguageService, detectInitialLang } from './language.service';

/** Validates the :lang URL segment and activates that language.
 *  Unknown prefixes redirect to the detected language. */
export const langGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const languageService = inject(LanguageService);
  const router = inject(Router);

  const lang = route.paramMap.get('lang');
  if (lang && (LANGS as readonly string[]).includes(lang)) {
    if (languageService.lang() !== lang) {
      languageService.use(lang as Lang);
    }
    return true;
  }
  return router.createUrlTree(['/', detectInitialLang()]);
};
