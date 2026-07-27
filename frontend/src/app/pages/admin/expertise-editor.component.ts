import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { ExpertiseItem } from '../../core/models';

@Component({
  selector: 'app-admin-expertise',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Expertise clé</h1>
    <p class="admin-sub">Blocs de compétences affichés dans la section « Ce que je fais de mieux ».</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ Nouveau bloc</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Modifier le bloc' : 'Nouveau bloc' }}</h2>
        <form class="form" style="max-width: none;" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label for="title">Titre</label>
              <input id="title" formControlName="title">
            </div>
            <div class="form-field">
              <label for="icon">Icône</label>
              <select id="icon" formControlName="icon">
                <option value="app">Fenêtre d'application</option>
                <option value="api">API / liens</option>
                <option value="shield">Bouclier (sécurité)</option>
                <option value="database">Base de données</option>
                <option value="gear">Engrenage (DevOps)</option>
                <option value="chart">Graphique (métier)</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="3"></textarea>
          </div>
          <div class="form-field" style="max-width: 200px;">
            <label for="sort_order">Ordre d'affichage</label>
            <input id="sort_order" type="number" formControlName="sort_order">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
            <button class="btn btn-ghost" type="button" (click)="editing.set(null)">Annuler</button>
          </div>
        </form>
      </div>
    }

    @if (items(); as list) {
      <table class="admin-table">
        <thead><tr><th>Ordre</th><th>Titre</th><th>Description</th><th></th></tr></thead>
        <tbody>
          @for (item of list; track item.id) {
            <tr>
              <td>{{ item.sort_order }}</td>
              <td><strong>{{ item.title }}</strong></td>
              <td>{{ item.description }}</td>
              <td class="row-actions">
                <button class="btn btn-secondary btn-sm" (click)="startEdit(item)">Modifier</button>
                <button class="btn btn-danger btn-sm" (click)="remove(item)">Supprimer</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <div class="loading-state"><div class="spinner"></div>Chargement…</div>
    }
  `,
})
export class ExpertiseEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  items = signal<ExpertiseItem[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    icon: ['app'],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listExpertise().subscribe((list) => this.items.set(list));
  }

  startCreate(): void {
    this.form.reset({ icon: 'app', sort_order: (this.items()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(item: ExpertiseItem): void {
    this.form.patchValue(item);
    this.editing.set({ id: item.id });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editing()?.id;
    const payload = this.form.getRawValue();
    const request = id
      ? this.api.update('expertise', id, payload)
      : this.api.create('expertise', payload);
    request.subscribe(() => {
      this.saving.set(false);
      this.editing.set(null);
      this.load();
    });
  }

  remove(item: ExpertiseItem): void {
    if (!confirm(`Supprimer « ${item.title} » ?`)) return;
    this.api.delete('expertise', item.id).subscribe(() => this.load());
  }
}
