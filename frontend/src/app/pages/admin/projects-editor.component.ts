import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AdminProject } from '../../core/models';
import { fromLines, fromStr, toLines, toStr } from './i18n-form.util';

@Component({
  selector: 'app-admin-projects',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Projets</h1>
    <p class="admin-sub">Études de cas dans les deux langues. Les projets non mis en avant restent en base mais sont masqués.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ Nouveau projet</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Modifier le projet' : 'Nouveau projet' }}</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label>Slug <span class="hint">(identifiant d'URL, ex. mon-projet)</span></label>
              <input formControlName="slug">
            </div>
            <div class="form-field">
              <label>Visuel</label>
              <select formControlName="visual">
                <option value="payments">Paiements / carte API</option>
                <option value="monitoring">Graphique monitoring</option>
                <option value="security">Bouclier sécurité</option>
                <option value="integration">Intégration de systèmes</option>
                <option value="bank">Modules bancaires</option>
                <option value="transfer">Transfert d'argent / globe</option>
                <option value="drone">Drone / carte</option>
              </select>
            </div>
          </div>

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
              <label>Rôle <span class="i18n-tag">EN</span></label>
              <input formControlName="role_en">
            </div>
            <div class="form-field">
              <label>Rôle <span class="i18n-tag">FR</span></label>
              <input formControlName="role_fr">
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Résumé <span class="i18n-tag">EN</span></label>
              <textarea formControlName="summary_en" rows="2"></textarea>
            </div>
            <div class="form-field">
              <label>Résumé <span class="i18n-tag">FR</span></label>
              <textarea formControlName="summary_fr" rows="2"></textarea>
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Impacts de la carte <span class="i18n-tag">EN</span> <span class="hint">(un par ligne, max 3)</span></label>
              <textarea formControlName="highlights_en" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label>Impacts de la carte <span class="i18n-tag">FR</span> <span class="hint">(un par ligne, max 3)</span></label>
              <textarea formControlName="highlights_fr" rows="3"></textarea>
            </div>
          </div>

          <h2 style="margin-top: 10px;">Étude de cas</h2>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Contexte <span class="i18n-tag">EN</span></label>
              <textarea formControlName="context_en" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label>Contexte <span class="i18n-tag">FR</span></label>
              <textarea formControlName="context_fr" rows="3"></textarea>
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Problème <span class="i18n-tag">EN</span></label>
              <textarea formControlName="problem_en" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label>Problème <span class="i18n-tag">FR</span></label>
              <textarea formControlName="problem_fr" rows="3"></textarea>
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Approche technique <span class="i18n-tag">EN</span></label>
              <textarea formControlName="approach_en" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label>Approche technique <span class="i18n-tag">FR</span></label>
              <textarea formControlName="approach_fr" rows="4"></textarea>
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Contributions clés <span class="i18n-tag">EN</span> <span class="hint">(un par ligne)</span></label>
              <textarea formControlName="contributions_en" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label>Contributions clés <span class="i18n-tag">FR</span> <span class="hint">(un par ligne)</span></label>
              <textarea formControlName="contributions_fr" rows="4"></textarea>
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Enseignements / valeur métier <span class="i18n-tag">EN</span></label>
              <textarea formControlName="learnings_en" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label>Enseignements / valeur métier <span class="i18n-tag">FR</span></label>
              <textarea formControlName="learnings_fr" rows="3"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Technologies <span class="hint">(une par ligne, affichées telles quelles dans les deux langues)</span></label>
              <textarea formControlName="tags" rows="4"></textarea>
            </div>
            <div class="form" style="align-content: start;">
              <div class="form-field" style="max-width: 160px;">
                <label>Ordre d'affichage</label>
                <input type="number" formControlName="sort_order">
              </div>
              <div class="form-field">
                <label>
                  <input type="checkbox" formControlName="featured" style="width: auto; margin-right: 8px;">
                  Visible sur le site public
                </label>
              </div>
            </div>
          </div>

          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button class="btn btn-quiet" type="button" (click)="cancel()">Annuler</button>
          </div>
        </form>
      </div>
    }

    @if (projects(); as list) {
      <table class="admin-table">
        <thead>
          <tr><th>Ordre</th><th>Titre</th><th>Rôle</th><th>Statut</th><th></th></tr>
        </thead>
        <tbody>
          @for (project of list; track project.id) {
            <tr>
              <td>{{ project.sort_order }}</td>
              <td>
                <strong>{{ project.title['en'] }}</strong><br>
                <span class="message-meta">/{{ project.slug }}</span>
              </td>
              <td>{{ project.role['en'] }}</td>
              <td>
                <span class="badge" [class.badge-read]="project.featured" [class.badge-hidden]="!project.featured">
                  {{ project.featured ? 'Visible' : 'Masqué' }}
                </span>
              </td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="startEdit(project)">Modifier</button>
                <button class="btn btn-danger btn-sm" (click)="remove(project)">Supprimer</button>
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
export class ProjectsEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  projects = signal<AdminProject[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    visual: ['payments'],
    title_en: ['', Validators.required],
    title_fr: [''],
    role_en: [''],
    role_fr: [''],
    summary_en: [''],
    summary_fr: [''],
    highlights_en: [''],
    highlights_fr: [''],
    context_en: [''],
    context_fr: [''],
    problem_en: [''],
    problem_fr: [''],
    approach_en: [''],
    approach_fr: [''],
    contributions_en: [''],
    contributions_fr: [''],
    learnings_en: [''],
    learnings_fr: [''],
    tags: [''],
    featured: [true],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listProjects().subscribe((list) => this.projects.set(list));
  }

  startCreate(): void {
    this.error.set('');
    this.form.reset({ visual: 'payments', featured: true, sort_order: (this.projects()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(p: AdminProject): void {
    this.error.set('');
    this.form.patchValue({
      slug: p.slug,
      visual: p.visual,
      title_en: toStr(p.title, 'en'), title_fr: toStr(p.title, 'fr'),
      role_en: toStr(p.role, 'en'), role_fr: toStr(p.role, 'fr'),
      summary_en: toStr(p.summary, 'en'), summary_fr: toStr(p.summary, 'fr'),
      highlights_en: toLines(p.highlights, 'en'), highlights_fr: toLines(p.highlights, 'fr'),
      context_en: toStr(p.context, 'en'), context_fr: toStr(p.context, 'fr'),
      problem_en: toStr(p.problem, 'en'), problem_fr: toStr(p.problem, 'fr'),
      approach_en: toStr(p.approach, 'en'), approach_fr: toStr(p.approach, 'fr'),
      contributions_en: toLines(p.contributions, 'en'), contributions_fr: toLines(p.contributions, 'fr'),
      learnings_en: toStr(p.learnings, 'en'), learnings_fr: toStr(p.learnings, 'fr'),
      tags: (p.tags ?? []).join('\n'),
      featured: p.featured,
      sort_order: p.sort_order,
    });
    this.editing.set({ id: p.id });
    window.scrollTo({ top: 0 });
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const r = this.form.getRawValue();
    const payload = {
      slug: r.slug,
      visual: r.visual,
      title: fromStr(r.title_en, r.title_fr),
      role: fromStr(r.role_en, r.role_fr),
      summary: fromStr(r.summary_en, r.summary_fr),
      highlights: fromLines(r.highlights_en, r.highlights_fr),
      context: fromStr(r.context_en, r.context_fr),
      problem: fromStr(r.problem_en, r.problem_fr),
      approach: fromStr(r.approach_en, r.approach_fr),
      contributions: fromLines(r.contributions_en, r.contributions_fr),
      learnings: fromStr(r.learnings_en, r.learnings_fr),
      tags: r.tags.split('\n').map((s) => s.trim()).filter(Boolean),
      featured: r.featured,
      sort_order: r.sort_order,
    };

    const id = this.editing()?.id;
    const request = id
      ? this.api.update<AdminProject>('projects', id, payload)
      : this.api.create<AdminProject>('projects', payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.status === 409 ? 'Un projet avec ce slug existe déjà.' : "Échec de l'enregistrement.");
      },
    });
  }

  remove(project: AdminProject): void {
    if (!confirm(`Supprimer « ${project.title['en']} » ?`)) return;
    this.api.delete('projects', project.id).subscribe(() => this.load());
  }
}
