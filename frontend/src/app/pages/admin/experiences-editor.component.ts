import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { Experience } from '../../core/models';

@Component({
  selector: 'app-admin-experiences',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Experience</h1>
    <p class="admin-sub">Professional timeline entries, ordered by "sort order".</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ New entry</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Edit entry' : 'New entry' }}</h2>
        <form class="form" style="max-width: none;" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label for="title">Title</label>
              <input id="title" formControlName="title" placeholder="e.g. IT Consultant / Full Stack Developer">
            </div>
            <div class="form-field">
              <label for="organization">Organization</label>
              <input id="organization" formControlName="organization">
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="period">Period <span class="hint">(e.g. 2022 — present)</span></label>
              <input id="period" formControlName="period">
            </div>
            <div class="form-field">
              <label for="sort_order">Sort order</label>
              <input id="sort_order" type="number" formControlName="sort_order">
            </div>
          </div>
          <div class="form-field">
            <label for="bullets">Impact bullets <span class="hint">(one per line)</span></label>
            <textarea id="bullets" formControlName="bullets" rows="5"></textarea>
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

    @if (experiences(); as list) {
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Title</th><th>Organization</th><th></th></tr></thead>
        <tbody>
          @for (experience of list; track experience.id) {
            <tr>
              <td>{{ experience.sort_order }}</td>
              <td><strong>{{ experience.title }}</strong></td>
              <td>{{ experience.organization }}</td>
              <td class="row-actions">
                <button class="btn btn-secondary btn-sm" (click)="startEdit(experience)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="remove(experience)">Delete</button>
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
export class ExperiencesEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  experiences = signal<Experience[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    organization: [''],
    period: [''],
    bullets: [''],
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

  startEdit(experience: Experience): void {
    this.form.patchValue({ ...experience, bullets: experience.bullets.join('\n') });
    this.editing.set({ id: experience.id });
    window.scrollTo({ top: 0 });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      bullets: raw.bullets.split('\n').map((s) => s.trim()).filter(Boolean),
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

  remove(experience: Experience): void {
    if (!confirm(`Delete "${experience.title}"?`)) return;
    this.api.delete('experiences', experience.id).subscribe(() => this.load());
  }
}
