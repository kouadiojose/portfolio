import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { AdminValueProp } from '../../core/models';
import { fromStr, toStr } from './i18n-form.util';

@Component({
  selector: 'app-admin-values',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Value propositions</h1>
    <p class="admin-sub">"Why work with me" blocks in both languages.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ New block</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Edit block' : 'New block' }}</h2>
        <form class="form" [formGroup]="form" (ngSubmit)="save()">
          <div class="i18n-pair">
            <div class="form-field">
              <label>Title <span class="i18n-tag">EN</span></label>
              <input formControlName="title_en">
            </div>
            <div class="form-field">
              <label>Title <span class="i18n-tag">FR</span></label>
              <input formControlName="title_fr">
            </div>
          </div>
          <div class="i18n-pair">
            <div class="form-field">
              <label>Description <span class="i18n-tag">EN</span></label>
              <textarea formControlName="description_en" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label>Description <span class="i18n-tag">FR</span></label>
              <textarea formControlName="description_fr" rows="3"></textarea>
            </div>
          </div>
          <div class="form-field" style="max-width: 160px;">
            <label>Sort order</label>
            <input type="number" formControlName="sort_order">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
            <button class="btn btn-quiet" type="button" (click)="editing.set(null)">Cancel</button>
          </div>
        </form>
      </div>
    }

    @if (items(); as list) {
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Title</th><th>Description</th><th></th></tr></thead>
        <tbody>
          @for (item of list; track item.id) {
            <tr>
              <td>{{ item.sort_order }}</td>
              <td><strong>{{ item.title['en'] }}</strong></td>
              <td>{{ item.description['en'] }}</td>
              <td class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="startEdit(item)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="remove(item)">Delete</button>
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
export class ValuesEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  items = signal<AdminValueProp[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title_en: ['', Validators.required],
    title_fr: [''],
    description_en: [''],
    description_fr: [''],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listValues().subscribe((list) => this.items.set(list));
  }

  startCreate(): void {
    this.form.reset({ sort_order: (this.items()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(item: AdminValueProp): void {
    this.form.patchValue({
      title_en: toStr(item.title, 'en'), title_fr: toStr(item.title, 'fr'),
      description_en: toStr(item.description, 'en'), description_fr: toStr(item.description, 'fr'),
      sort_order: item.sort_order,
    });
    this.editing.set({ id: item.id });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const r = this.form.getRawValue();
    const payload = {
      title: fromStr(r.title_en, r.title_fr),
      description: fromStr(r.description_en, r.description_fr),
      sort_order: r.sort_order,
    };
    const id = this.editing()?.id;
    const request = id ? this.api.update('values', id, payload) : this.api.create('values', payload);
    request.subscribe(() => {
      this.saving.set(false);
      this.editing.set(null);
      this.load();
    });
  }

  remove(item: AdminValueProp): void {
    if (!confirm(`Delete "${item.title['en']}"?`)) return;
    this.api.delete('values', item.id).subscribe(() => this.load());
  }
}
