import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { LanguageService } from './language.service';
import { PortfolioContent } from './models';

function mockContent(): PortfolioContent {
  return {
    settings: {} as any,
    stack: [],
    projects: [],
    experiences: [],
    values: [],
  };
}

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let lang: ReturnType<typeof signal<string>>;

  beforeEach(() => {
    lang = signal('en');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LanguageService, useValue: { lang } },
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('fetches /api/content with the active language', async () => {
    const promise = firstValueFrom(service.content$);
    TestBed.flushEffects();
    const req = httpMock.expectOne((r) => r.url === '/api/content');
    expect(req.request.params.get('lang')).toBe('en');
    req.flush(mockContent());
    await promise;
  });

  it('caches content per language — a second subscription issues no new request', async () => {
    const first = firstValueFrom(service.content$);
    TestBed.flushEffects();
    httpMock.expectOne((r) => r.url === '/api/content').flush(mockContent());
    await first;

    const cached = await firstValueFrom(service.content$);
    httpMock.expectNone((r) => r.url === '/api/content');
    expect(cached).toBeTruthy();
  });

  it('re-fetches when the active language changes', async () => {
    const first = firstValueFrom(service.content$);
    TestBed.flushEffects();
    httpMock.expectOne((r) => r.params.get('lang') === 'en').flush(mockContent());
    await first;

    lang.set('fr');
    const second = firstValueFrom(service.content$);
    TestBed.flushEffects();
    const req = httpMock.expectOne((r) => r.params.get('lang') === 'fr');
    expect(req.request.params.get('lang')).toBe('fr');
    req.flush(mockContent());
    await second;
  });

  it('getProject requests the project by slug in the active language', async () => {
    lang.set('fr');
    const promise = firstValueFrom(service.getProject('my-project'));
    const req = httpMock.expectOne((r) => r.url === '/api/projects/my-project');
    expect(req.request.params.get('lang')).toBe('fr');
    req.flush({ id: 1 } as any);
    await promise;
  });

  it('getContactChallenge extracts the token from the response', async () => {
    const promise = firstValueFrom(service.getContactChallenge());
    const req = httpMock.expectOne('/api/contact/challenge');
    req.flush({ token: 'abc123' });
    expect(await promise).toBe('abc123');
  });

  it('sendMessage posts the payload with language and challenge attached', async () => {
    lang.set('fr');
    const payload = { name: 'A', email: 'a@b.com', subject: 'S', body: 'B', website: '' };
    const promise = firstValueFrom(service.sendMessage(payload, 'chal-token'));
    const req = httpMock.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ...payload, language: 'fr', challenge: 'chal-token' });
    req.flush({ detail: 'ok' });
    await promise;
  });
});
