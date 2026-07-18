import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AdminSiteSettings } from '../../core/models';
import { fromLines, fromStr, toLines, toStr } from './i18n-form.util';

/** Edits the global bilingual site content. List-like fields are edited
 *  one item per line, in English and French side by side. */
@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Site content</h1>
    <p class="admin-sub">Global texts in both languages. Changes are live immediately after saving.</p>

    @if (loaded()) {
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="admin-panel">
          <h2>Hero</h2>
          <div class="form">
            <div class="form-field">
              <label>Full name</label>
              <input formControlName="full_name">
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Headline <span class="i18n-tag">EN</span></label>
                <input formControlName="headline_en">
              </div>
              <div class="form-field">
                <label>Headline <span class="i18n-tag">FR</span></label>
                <input formControlName="headline_fr">
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Tagline <span class="i18n-tag">EN</span></label>
                <textarea formControlName="tagline_en" rows="2"></textarea>
              </div>
              <div class="form-field">
                <label>Tagline <span class="i18n-tag">FR</span></label>
                <textarea formControlName="tagline_fr" rows="2"></textarea>
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Subtitle <span class="i18n-tag">EN</span></label>
                <textarea formControlName="hero_subtitle_en" rows="2"></textarea>
              </div>
              <div class="form-field">
                <label>Subtitle <span class="i18n-tag">FR</span></label>
                <textarea formControlName="hero_subtitle_fr" rows="2"></textarea>
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Availability <span class="i18n-tag">EN</span></label>
                <input formControlName="availability_en">
              </div>
              <div class="form-field">
                <label>Availability <span class="i18n-tag">FR</span></label>
                <input formControlName="availability_fr">
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Impact strip <span class="i18n-tag">EN</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="impacts_en" rows="4"></textarea>
              </div>
              <div class="form-field">
                <label>Impact strip <span class="i18n-tag">FR</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="impacts_fr" rows="4"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-panel">
          <h2>About</h2>
          <div class="form">
            <div class="i18n-pair">
              <div class="form-field">
                <label>Section title <span class="i18n-tag">EN</span></label>
                <input formControlName="about_title_en">
              </div>
              <div class="form-field">
                <label>Section title <span class="i18n-tag">FR</span></label>
                <input formControlName="about_title_fr">
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Paragraphs <span class="i18n-tag">EN</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="about_paragraphs_en" rows="5"></textarea>
              </div>
              <div class="form-field">
                <label>Paragraphs <span class="i18n-tag">FR</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="about_paragraphs_fr" rows="5"></textarea>
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>"How I work" principles <span class="i18n-tag">EN</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="principles_en" rows="4"></textarea>
              </div>
              <div class="form-field">
                <label>"How I work" principles <span class="i18n-tag">FR</span> <span class="hint">(one per line)</span></label>
                <textarea formControlName="principles_fr" rows="4"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="admin-panel">
          <h2>Contact & links</h2>
          <div class="form">
            <div class="form-row">
              <div class="form-field">
                <label>Public email</label>
                <input formControlName="email">
              </div>
              <div class="form-field">
                <label>LinkedIn URL</label>
                <input formControlName="linkedin_url">
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>GitHub URL</label>
                <input formControlName="github_url">
              </div>
              <div class="form-field">
                <label>Phone</label>
                <input formControlName="phone">
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>CV file <span class="i18n-tag">EN</span></label>
                <input formControlName="cv_url_en">
              </div>
              <div class="form-field">
                <label>CV file <span class="i18n-tag">FR</span></label>
                <input formControlName="cv_url_fr">
              </div>
            </div>
            <div class="i18n-pair">
              <div class="form-field">
                <label>Contact intro <span class="i18n-tag">EN</span></label>
                <textarea formControlName="contact_lead_en" rows="2"></textarea>
              </div>
              <div class="form-field">
                <label>Contact intro <span class="i18n-tag">FR</span></label>
                <textarea formControlName="contact_lead_fr" rows="2"></textarea>
              </div>
            </div>
          </div>
        </div>

        @if (saved()) {
          <div class="alert alert-success" style="margin-bottom: 18px;">Saved. The public site is up to date.</div>
        }
        @if (error()) {
          <div class="alert alert-error" style="margin-bottom: 18px;">Saving failed. Please retry.</div>
        }

        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving…' : 'Save changes' }}
        </button>
      </form>

      } @else {
      <div class="loading-state"><div class="spinner"></div></div>
    }
  `,
})
export class SettingsEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  loaded = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal(false);

  form = this.fb.nonNullable.group({
    full_name: ['', Validators.required],
    headline_en: ['', Validators.required],
    headline_fr: [''],
    tagline_en: [''],
    tagline_fr: [''],
    hero_subtitle_en: [''],
    hero_subtitle_fr: [''],
    availability_en: [''],
    availability_fr: [''],
    impacts_en: [''],
    impacts_fr: [''],
    about_title_en: [''],
    about_title_fr: [''],
    about_paragraphs_en: [''],
    about_paragraphs_fr: [''],
    principles_en: [''],
    principles_fr: [''],
    email: [''],
    phone: [''],
    linkedin_url: [''],
    github_url: [''],
    cv_url_en: [''],
    cv_url_fr: [''],
    contact_lead_en: [''],
    contact_lead_fr: [''],
  });


  constructor() {
    this.api.getSettings().subscribe((s) => {
      this.form.patchValue({
        full_name: s.full_name,
        headline_en: toStr(s.headline, 'en'), headline_fr: toStr(s.headline, 'fr'),
        tagline_en: toStr(s.tagline, 'en'), tagline_fr: toStr(s.tagline, 'fr'),
        hero_subtitle_en: toStr(s.hero_subtitle, 'en'), hero_subtitle_fr: toStr(s.hero_subtitle, 'fr'),
        availability_en: toStr(s.availability, 'en'), availability_fr: toStr(s.availability, 'fr'),
        impacts_en: toLines(s.impacts, 'en'), impacts_fr: toLines(s.impacts, 'fr'),
        about_title_en: toStr(s.about_title, 'en'), about_title_fr: toStr(s.about_title, 'fr'),
        about_paragraphs_en: toLines(s.about_paragraphs, 'en'), about_paragraphs_fr: toLines(s.about_paragraphs, 'fr'),
        principles_en: toLines(s.principles, 'en'), principles_fr: toLines(s.principles, 'fr'),
        email: s.email,
        phone: s.phone,
        linkedin_url: s.linkedin_url,
        github_url: s.github_url,
        cv_url_en: toStr(s.cv_url, 'en'), cv_url_fr: toStr(s.cv_url, 'fr'),
        contact_lead_en: toStr(s.contact_lead, 'en'), contact_lead_fr: toStr(s.contact_lead, 'fr'),
      });
      this.loaded.set(true);
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(false);

    const r = this.form.getRawValue();
    const payload: Partial<AdminSiteSettings> = {
      full_name: r.full_name,
      headline: fromStr(r.headline_en, r.headline_fr),
      tagline: fromStr(r.tagline_en, r.tagline_fr),
      hero_subtitle: fromStr(r.hero_subtitle_en, r.hero_subtitle_fr),
      availability: fromStr(r.availability_en, r.availability_fr),
      impacts: fromLines(r.impacts_en, r.impacts_fr),
      about_title: fromStr(r.about_title_en, r.about_title_fr),
      about_paragraphs: fromLines(r.about_paragraphs_en, r.about_paragraphs_fr),
      principles: fromLines(r.principles_en, r.principles_fr),
      email: r.email,
      phone: r.phone,
      linkedin_url: r.linkedin_url,
      github_url: r.github_url,
      cv_url: fromStr(r.cv_url_en, r.cv_url_fr),
      contact_lead: fromStr(r.contact_lead_en, r.contact_lead_fr),
    };

    this.api.updateSettings(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.error.set(true);
      },
    });
  }

}
