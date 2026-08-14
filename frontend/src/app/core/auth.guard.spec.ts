import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let isLoggedIn: boolean;
  let router: Router;

  beforeEach(() => {
    isLoggedIn = false;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isLoggedIn: () => isLoggedIn },
        },
        {
          provide: Router,
          useValue: { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as UrlTree) },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
  }

  it('allows activation when logged in', () => {
    isLoggedIn = true;
    expect(runGuard()).toBe(true);
  });

  it('redirects to /admin/login when logged out', () => {
    isLoggedIn = false;
    const result = runGuard();
    expect(result).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/login']);
  });
});
