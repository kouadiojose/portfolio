import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { StackItem } from '../../core/models';

@Component({
  selector: 'app-admin-stack',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Tech stack</h1>
    <p class="admin-sub">Technologies grouped by category — no percentages, by design.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ New item</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Edit item' : 'New item' }}</h2>
        <form class="form" style="max-width: none;" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label for="category">Category <span class="hint">(e.g. Frontend, Backend, Database)</span></label>
              <input id="category" formControlName="category" list="categories">
              <datalist id="categories">
                @for (category of categories(); track category) {
                  <option [value]="category"></option>
                }
              </datalist>
            </div>
            <div class="form-field">
              <label for="name">Technology</label>
              <input id="name" formControlName="name">
            </div>
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
        <thead><tr><th>Order</th><th>Category</th><th>Technology</th><th></th></tr></thead>
        <tbody>
          @for (item of list; track item.id) {
            <tr>
              <td>{{ item.sort_order }}</td>
              <td>{{ item.category }}</td>
              <td><strong>{{ item.name }}</strong></td>
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
export class StackEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  items = signal<StackItem[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  categories = signal<string[]>([]);

  form = this.fb.nonNullable.group({
    category: ['', Validators.required],
    name: ['', Validators.required],
    sort_order: [0],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listStack().subscribe((list) => {
      this.items.set(list);
      this.categories.set([...new Set(list.map((item) => item.category))]);
    });
  }

  startCreate(): void {
    this.form.reset({ sort_order: (this.items()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(item: StackItem): void {
    this.form.patchValue(item);
    this.editing.set({ id: item.id });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editing()?.id;
    const payload = this.form.getRawValue();
    const request = id
      ? this.api.update('stack', id, payload)
      : this.api.create('stack', payload);
    request.subscribe(() => {
      this.saving.set(false);
      this.editing.set(null);
      this.load();
    });
  }

  remove(item: StackItem): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.api.delete('stack', item.id).subscribe(() => this.load());
  }
}
