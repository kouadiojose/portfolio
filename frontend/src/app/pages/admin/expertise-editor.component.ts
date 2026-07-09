import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { ExpertiseItem } from '../../core/models';

@Component({
  selector: 'app-admin-expertise',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Core expertise</h1>
    <p class="admin-sub">Capability blocks shown in the "What I do best" section.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ New block</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Edit block' : 'New block' }}</h2>
        <form class="form" style="max-width: none;" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label for="title">Title</label>
              <input id="title" formControlName="title">
            </div>
            <div class="form-field">
              <label for="icon">Icon</label>
              <select id="icon" formControlName="icon">
                <option value="app">App window</option>
                <option value="api">API / links</option>
                <option value="shield">Shield (security)</option>
                <option value="database">Database</option>
                <option value="gear">Gear (DevOps)</option>
                <option value="chart">Chart (business)</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label for="description">Description</label>
            <textarea id="description" formControlName="description" rows="3"></textarea>
          </div>
          <div class="form-field" style="max-width: 200px;">
            <label for="sort_order">Sort order</label>
            <input id="sort_order" type="number" formControlName="sort_order">
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
            <button class="btn btn-ghost" type="button" (click)="editing.set(null)">Cancel</button>
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
              <td><strong>{{ item.title }}</strong></td>
              <td>{{ item.description }}</td>
              <td class="row-actions">
                <button class="btn btn-secondary btn-sm" (click)="startEdit(item)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="remove(item)">Delete</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    } @else {
      <div class="loading-state"><div class="spinner"></div>Loading…</div>
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
    if (!confirm(`Delete "${item.title}"?`)) return;
    this.api.delete('expertise', item.id).subscribe(() => this.load());
  }
}
