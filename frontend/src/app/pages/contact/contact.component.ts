import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { ApiService } from '../../core/api.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-contact',
  imports: [AsyncPipe, ReactiveFormsModule, TranslocoPipe],
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="section-eyebrow">{{ 'contact.eyebrow' | transloco }}</p>
          <h1 class="section-title">{{ 'contact.title' | transloco }}</h1>
        </div>

        <div class="contact-grid">
          <div>
            @if (api.content$ | async; as content) {
              <p class="contact-lead">{{ content.settings.contact_lead }}</p>
              <div class="contact-links">
                <a [href]="'mailto:' + content.settings.email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></svg>
                  {{ content.settings.email }}
                </a>
                @if (content.settings.phone) {
                  <a [href]="'tel:' + content.settings.phone.replaceAll(' ', '')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {{ content.settings.phone }}
                  </a>
                }
                <a [href]="content.settings.linkedin_url" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v1.5"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
                <a [href]="content.settings.github_url" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
                  GitHub
                </a>
                <a [href]="content.settings.cv_url" download>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
                  {{ 'hero.downloadCv' | transloco }}
                </a>
              </div>
            }
          </div>

          <div>
            @if (sent()) {
              <div class="alert alert-success" role="status">{{ 'contact.form.sent' | transloco }}</div>
            } @else {
              <form class="form" [formGroup]="form" (ngSubmit)="submit()">
                <div class="form-row">
                  <div class="form-field">
                    <label for="name">{{ 'contact.form.name' | transloco }}</label>
                    <input id="name" type="text" formControlName="name" autocomplete="name"
                           [placeholder]="'contact.form.namePlaceholder' | transloco">
                    @if (invalid('name')) {
                      <span class="field-error">{{ 'contact.form.nameError' | transloco }}</span>
                    }
                  </div>
                  <div class="form-field">
                    <label for="email">{{ 'contact.form.email' | transloco }}</label>
                    <input id="email" type="email" formControlName="email" autocomplete="email"
                           [placeholder]="'contact.form.emailPlaceholder' | transloco">
                    @if (invalid('email')) {
                      <span class="field-error">{{ 'contact.form.emailError' | transloco }}</span>
                    }
                  </div>
                </div>
                <div class="form-field">
                  <label for="subject">{{ 'contact.form.subject' | transloco }}</label>
                  <input id="subject" type="text" formControlName="subject"
                         [placeholder]="'contact.form.subjectPlaceholder' | transloco">
                </div>
                <div class="form-field">
                  <label for="body">{{ 'contact.form.message' | transloco }}</label>
                  <textarea id="body" formControlName="body" rows="5"
                            [placeholder]="'contact.form.messagePlaceholder' | transloco"></textarea>
                  @if (invalid('body')) {
                    <span class="field-error">{{ 'contact.form.messageError' | transloco }}</span>
                  }
                </div>

                @if (error()) {
                  <div class="alert alert-error" role="alert">{{ 'contact.form.error' | transloco }}</div>
                }

                <div>
                  <button class="btn btn-primary" type="submit" [disabled]="sending()">
                    {{ (sending() ? 'contact.form.sending' : 'contact.form.send') | transloco }}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  api = inject(ApiService);
  private language = inject(LanguageService);
  private fb = inject(FormBuilder);

  sending = signal(false);
  sent = signal(false);
  error = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    body: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor() {
    this.language.setPageMeta('meta.contactTitle', 'meta.homeDescription');
  }

  invalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.error.set(false);
    this.api.sendMessage(this.form.getRawValue()).subscribe({
      next: () => this.sent.set(true),
      error: () => {
        this.sending.set(false);
        this.error.set(true);
      },
    });
  }
}
