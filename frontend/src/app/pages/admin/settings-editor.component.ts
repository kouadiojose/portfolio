import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AuthService } from '../../core/auth.service';
import { SiteSettings } from '../../core/models';

/** Edits the global site content (hero, about, contact links).
 *  List-like fields (paragraphs, facts) are edited one item per line. */
@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Site content</h1>
    <p class="admin-sub">Global texts shown on the public site. Changes are live immediately after saving.</p>

    @if (loaded()) {
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="admin-panel">
          <h2>Hero</h2>
          <div class="form">
            <div class="form-row">
              <div class="form-field">
                <label for="full_name">Full name</label>
                <input id="full_name" formControlName="full_name">
              </div>
              <div class="form-field">
                <label for="headline">Headline</label>
                <input id="headline" formControlName="headline">
              </div>
            </div>
            <div class="form-field">
              <label for="hero_eyebrow">Eyebrow (line above the headline)</label>
              <input id="hero_eyebrow" formControlName="hero_eyebrow">
            </div>
            <div class="form-field">
              <label for="hero_subtitle">Subtitle</label>
              <textarea id="hero_subtitle" formControlName="hero_subtitle" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label for="availability">Availability line</label>
              <input id="availability" formControlName="availability">
            </div>
          </div>
        </div>

        <div class="admin-panel">
          <h2>About</h2>
          <div class="form">
            <div class="form-field">
              <label for="about_title">Section title</label>
              <input id="about_title" formControlName="about_title">
            </div>
            <div class="form-field">
              <label for="about_paragraphs">Paragraphs <span class="hint">(one per line)</span></label>
              <textarea id="about_paragraphs" formControlName="about_paragraphs" rows="6"></textarea>
            </div>
            <div class="form-field">
              <label for="facts">Key facts <span class="hint">(one per line, format: Label | Value)</span></label>
              <textarea id="facts" formControlName="facts" rows="5"></textarea>
            </div>
          </div>
        </div>

        <div class="admin-panel">
          <h2>Contact & links</h2>
          <div class="form">
            <div class="form-row">
              <div class="form-field">
                <label for="email">Public email</label>
                <input id="email" formControlName="email">
              </div>
              <div class="form-field">
                <label for="cv_url">CV URL</label>
                <input id="cv_url" formControlName="cv_url">
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="linkedin_url">LinkedIn URL</label>
                <input id="linkedin_url" formControlName="linkedin_url">
              </div>
              <div class="form-field">
                <label for="github_url">GitHub URL</label>
                <input id="github_url" formControlName="github_url">
              </div>
            </div>
            <div class="form-field">
              <label for="contact_lead">Contact section intro</label>
              <textarea id="contact_lead" formControlName="contact_lead" rows="2"></textarea>
            </div>
          </div>
        </div>

        @if (saved()) {
          <div class="alert alert-success" style="margin-bottom: 18px;">Saved. The public site is up to date.</div>
        }
        @if (error()) {
          <div class="alert alert-error" style="margin-bottom: 18px;">{{ error() }}</div>
        }

        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving…' : 'Save changes' }}
        </button>
      </form>

      <div class="admin-panel" style="margin-top: 34px;">
        <h2>Change password</h2>
        <form class="form" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <div class="form-row">
            <div class="form-field">
              <label for="current_password">Current password</label>
              <input id="current_password" type="password" formControlName="current_password" autocomplete="current-password">
            </div>
            <div class="form-field">
              <label for="new_password">New password <span class="hint">(min. 8 characters)</span></label>
              <input id="new_password" type="password" formControlName="new_password" autocomplete="new-password">
            </div>
          </div>
          @if (passwordMessage()) {
            <div class="alert" [class.alert-success]="passwordOk()" [class.alert-error]="!passwordOk()">
              {{ passwordMessage() }}
            </div>
          }
          <div>
            <button class="btn btn-secondary" type="submit" [disabled]="passwordForm.invalid">Update password</button>
          </div>
        </form>
      </div>
    } @else {
      <div class="loading-state"><div class="spinner"></div>Loading…</div>
    }
  `,
})
export class SettingsEditorComponent {
  private api = inject(AdminApiService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  loaded = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal('');
  passwordMessage = signal('');
  passwordOk = signal(false);

  form = this.fb.nonNullable.group({
    full_name: ['', Validators.required],
    headline: ['', Validators.required],
    hero_eyebrow: [''],
    hero_subtitle: [''],
    availability: [''],
    about_title: [''],
    about_paragraphs: [''],
    facts: [''],
    email: [''],
    linkedin_url: [''],
    github_url: [''],
    cv_url: [''],
    contact_lead: [''],
  });

  passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.api.getSettings().subscribe((settings) => {
      this.form.patchValue({
        ...settings,
        about_paragraphs: settings.about_paragraphs.join('\n'),
        facts: settings.facts.map((f) => `${f.label} | ${f.value}`).join('\n'),
      });
      this.loaded.set(true);
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saved.set(false);
    this.error.set('');

    const raw = this.form.getRawValue();
    const payload: Partial<SiteSettings> = {
      ...raw,
      about_paragraphs: raw.about_paragraphs.split('\n').map((s) => s.trim()).filter(Boolean),
      facts: raw.facts
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split('|');
          return { label: label.trim(), value: rest.join('|').trim() };
        }),
    };

    this.api.updateSettings(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Saving failed. Please retry.');
      },
    });
  }

  changePassword(): void {
    const { current_password, new_password } = this.passwordForm.getRawValue();
    this.auth.changePassword(current_password, new_password).subscribe({
      next: () => {
        this.passwordOk.set(true);
        this.passwordMessage.set('Password updated.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordOk.set(false);
        this.passwordMessage.set(
          err.status === 400 ? 'Current password is incorrect.' : 'Password update failed.'
        );
      },
    });
  }
}
