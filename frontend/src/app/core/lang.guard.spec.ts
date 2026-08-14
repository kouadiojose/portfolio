import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { langGuard } from './lang.guard';
import { detectInitialLang, LanguageService } from './language.service';

describe('langGuard', () => {
  let currentLang: string;
  let useSpy: jasmine.Spy;
  let router: Router;

  beforeEach(() => {
    currentLang = 'en';
    useSpy = jasmine.createSpy('use').and.callFake((lang: string) => (currentLang = lang));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LanguageService,
          useValue: { lang: () => currentLang, use: useSpy },
        },
        {
          provide: Router,
          useValue: { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as UrlTree) },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  function runGuard(lang: string | null) {
    const route = { paramMap: { get: () => lang } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => langGuard(route, {} as any));
  }

  it('activates and switches when the URL language differs from the active one', () => {
    currentLang = 'en';
    const result = runGuard('fr');
    expect(result).toBe(true);
    expect(useSpy).toHaveBeenCalledWith('fr');
  });

  it('activates without switching when the URL language already matches', () => {
    currentLang = 'fr';
    const result = runGuard('fr');
    expect(result).toBe(true);
    expect(useSpy).not.toHaveBeenCalled();
  });

  it('redirects to the detected language for an unknown prefix', () => {
    const result = runGuard('de');
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/', detectInitialLang()]);
  });

  it('redirects to the detected language when the prefix is missing', () => {
    const result = runGuard(null);
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/', detectInitialLang()]);
  });
});
