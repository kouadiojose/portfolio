import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AdminExperience } from '../../core/models';
import { fromLines, fromStr, toLines, toStr } from './i18n-form.util';

@Component({
  selector: 'app-admin-experiences',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Expériences</h1>
    <p class="admin-sub">Parcours professionnel dans les deux langues.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ Nouvelle entrée</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? "Modifier l'entrée" : 'Nouvelle entrée' }}</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <div class="i18n-pair">
            <div class="form-field">
              <label>Titre <span class="i18n-tag">EN</span></label>
              <input formControlName="title_en">
            </div>
            <div class="form-field">
              <label>Titre <span class="i18n-tag">FR</span></label>
              <input formControlName="title_fr">
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Organisation <span class="i18n-tag">EN</span></label>
              <input formControlName="organization_en">
            </div>
            <div class="form-field">
              <label>Organisation <span class="i18n-tag">FR</span></label>
              <input formControlName="organization_fr">
            </div>
          </div>
          <div class="form-field" style="max-width: 160px;">
            <label>Ordre d'affichage</label>
            <input type="number" formControlName="sort_order">
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Période <span class="i18n-tag">EN</span> <span class="hint">(ex. 2022 — present)</span></label>
              <input formControlName="period_en">
            </div>
            <div class="form-field">
              <label>Période <span class="i18n-tag">FR</span> <span class="hint">(ex. 2022 — aujourd'hui)</span></label>
              <input formControlName="period_fr">
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Points d'impact <span class="i18n-tag">EN</span> <span class="hint">(un par ligne)</span></label>
              <textarea formControlName="bullets_en" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label>Points d'impact <span class="i18n-tag">FR</span> <span class="hint">(un par ligne)</span></label>
              <textarea formControlName="bullets_fr" rows="4"></textarea>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button class="btn btn-quiet" type="button" (click)="editing.set(null)">Annuler</button>
          </div>
        </form>
      </div>
    }

    @if (experiences(); as list) {
      <table class="admin-table">
        <thead><tr><th>Ordre</th><th>Titre</th><th>Organisation</th><th></th></tr></thead>
        <tbody>
          @for (experience of list; track experience.id) {
            <tr>
              <td>{{ experience.sort_order }}</td>
              <td><strong>{{ experience.title['en'] }}</strong></td>
              <td>{{ experience.organization['en'] }}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="startEdit(experience)">Modifier</button>
                <button class="btn btn-danger btn-sm" (click)="remove(experience)">Supprimer</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <div class="loading-state"><div class="spinner"></div></div>
    }
  `,
})
export class ExperiencesEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  experiences = signal<AdminExperience[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title_en: ['', Validators.required],
    title_fr: [''],
    organization_en: [''],
    organization_fr: [''],
    period_en: [''],
    period_fr: [''],
    bullets_en: [''],
    bullets_fr: [''],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listExperiences().subscribe((list) => this.experiences.set(list));
  }

  startCreate(): void {
    this.form.reset({ sort_order: (this.experiences()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(e: AdminExperience): void {
    this.form.patchValue({
      title_en: toStr(e.title, 'en'), title_fr: toStr(e.title, 'fr'),
      organization_en: toStr(e.organization, 'en'),
      organization_fr: toStr(e.organization, 'fr'),
      period_en: toStr(e.period, 'en'), period_fr: toStr(e.period, 'fr'),
      bullets_en: toLines(e.bullets, 'en'), bullets_fr: toLines(e.bullets, 'fr'),
      sort_order: e.sort_order,
    });
    this.editing.set({ id: e.id });
    window.scrollTo({ top: 0 });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const r = this.form.getRawValue();
    const payload = {
      title: fromStr(r.title_en, r.title_fr),
      organization: fromStr(r.organization_en, r.organization_fr),
      period: fromStr(r.period_en, r.period_fr),
      bullets: fromLines(r.bullets_en, r.bullets_fr),
      sort_order: r.sort_order,
    };
    const id = this.editing()?.id;
    const request = id
      ? this.api.update('experiences', id, payload)
      : this.api.create('experiences', payload);
    request.subscribe(() => {
      this.saving.set(false);
      this.editing.set(null);
      this.load();
    });
  }

  remove(e: AdminExperience): void {
    if (!confirm(`Supprimer « ${e.title['en']} » ?`)) return;
    this.api.delete('experiences', e.id).subscribe(() => this.load());
  }
}
