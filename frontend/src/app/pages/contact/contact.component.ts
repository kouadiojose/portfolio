import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-contact',
  imports: [AsyncPipe, ReactiveFormsModule],
  template: `
    <section class="section">
      <div class="container">
        <p class="section-eyebrow">Contact</p>
        <h1 class="section-title">Available for international opportunities</h1>

        @if (api.content$ | async; as content) {
          <p class="contact-lead">{{ content.settings.contact_lead }}</p>
          <div class="contact-actions" style="margin-bottom: 44px;">
            <a class="btn btn-secondary" [href]="'mailto:' + content.settings.email">{{ content.settings.email }}</a>
            <a class="btn btn-secondary" [href]="content.settings.linkedin_url" target="_blank" rel="noopener">LinkedIn</a>
            <a class="btn btn-secondary" [href]="content.settings.github_url" target="_blank" rel="noopener">GitHub</a>
          </div>
        }

        @if (sent()) {
          <div class="alert alert-success" role="status">
            Message sent — thank you! I usually reply within 24 hours.
          </div>
        } @else {
          <form class="form" [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-row">
              <div class="form-field">
                <label for="name">Your name</label>
                <input id="name" type="text" formControlName="name" autocomplete="name">
                @if (invalid('name')) {
                  <span class="field-error">Please enter your name (at least 2 characters).</span>
                }
              </div>
              <div class="form-field">
                <label for="email">Your email</label>
                <input id="email" type="email" formControlName="email" autocomplete="email">
                @if (invalid('email')) {
                  <span class="field-error">Please enter a valid email address.</span>
                }
              </div>
            </div>
            <div class="form-field">
              <label for="subject">Subject</label>
              <input id="subject" type="text" formControlName="subject"
                     placeholder="e.g. Senior Full Stack role — remote">
            </div>
            <div class="form-field">
              <label for="body">Message</label>
              <textarea id="body" formControlName="body" rows="6"
                        placeholder="Tell me about the role or the project…"></textarea>
              @if (invalid('body')) {
                <span class="field-error">Please write a short message (at least 10 characters).</span>
              }
            </div>

            @if (error()) {
              <div class="alert alert-error" role="alert">{{ error() }}</div>
            }

            <div>
              <button class="btn btn-primary" type="submit" [disabled]="sending()">
                {{ sending() ? 'Sending…' : 'Send message' }}
              </button>
            </div>
          </form>
        }
      </div>
    </section>
  `,
})
export class ContactComponent {
  api = inject(ApiService);
  private fb = inject(FormBuilder);

  sending = signal(false);
  sent = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    body: ['', [Validators.required, Validators.minLength(10)]],
  });

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
    this.error.set('');
    this.api.sendMessage(this.form.getRawValue()).subscribe({
      next: () => this.sent.set(true),
      error: () => {
        this.sending.set(false);
        this.error.set('Something went wrong while sending your message. Please retry or email me directly.');
      },
    });
  }
}
