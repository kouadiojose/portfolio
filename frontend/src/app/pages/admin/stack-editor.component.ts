import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AdminStackItem } from '../../core/models';
import { fromStr, toStr } from './i18n-form.util';

@Component({
  selector: 'app-admin-stack',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Stack technique</h1>
    <p class="admin-sub">Technologies groupées par catégorie — les libellés de catégorie sont bilingues.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ Nouvel élément</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? "Modifier l'élément" : 'Nouvel élément' }}</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <div class="i18n-pair">
            <div class="form-field">
              <label>Catégorie <span class="i18n-tag">EN</span> <span class="hint">(ex. Frontend, Security)</span></label>
              <input formControlName="category_en">
            </div>
            <div class="form-field">
              <label>Catégorie <span class="i18n-tag">FR</span> <span class="hint">(ex. Frontend, Sécurité)</span></label>
              <input formControlName="category_fr">
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Technologie</label>
              <input formControlName="name">
            </div>
            <div class="form-field" style="max-width: 160px;">
              <label>Ordre d'affichage</label>
              <input type="number" formControlName="sort_order">
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

    @if (items(); as list) {
      <table class="admin-table">
        <thead><tr><th>Ordre</th><th>Catégorie</th><th>Technologie</th><th></th></tr></thead>
        <tbody>
          @for (item of list; track item.id) {
            <tr>
              <td>{{ item.sort_order }}</td>
              <td>{{ item.category['en'] }}</td>
              <td><strong>{{ item.name }}</strong></td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="startEdit(item)">Modifier</button>
                <button class="btn btn-danger btn-sm" (click)="remove(item)">Supprimer</button>
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
export class StackEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  items = signal<AdminStackItem[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    category_en: ['', Validators.required],
    category_fr: [''],
    name: ['', Validators.required],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listStack().subscribe((list) => this.items.set(list));
  }

  startCreate(): void {
    this.form.reset({ sort_order: (this.items()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(item: AdminStackItem): void {
    this.form.patchValue({
      category_en: toStr(item.category, 'en'),
      category_fr: toStr(item.category, 'fr'),
      name: item.name,
      sort_order: item.sort_order,
    });
    this.editing.set({ id: item.id });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const r = this.form.getRawValue();
    const payload = {
      category: fromStr(r.category_en, r.category_fr),
      name: r.name,
      sort_order: r.sort_order,
    };
    const id = this.editing()?.id;
    const request = id ? this.api.update('stack', id, payload) : this.api.create('stack', payload);
    request.subscribe(() => {
      this.saving.set(false);
      this.editing.set(null);
      this.load();
    });
  }

  remove(item: AdminStackItem): void {
    if (!confirm(`Supprimer « ${item.name} » ?`)) return;
    this.api.delete('stack', item.id).subscribe(() => this.load());
  }
}
