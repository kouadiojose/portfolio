import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdminApiService } from '../../core/admin-api.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-admin-projects',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Projects</h1>
    <p class="admin-sub">Featured projects shown on the public site. Unfeatured projects stay in the database but are hidden.</p>

    <div class="admin-toolbar">
      <span></span>
      <button class="btn btn-primary btn-sm" (click)="startCreate()">+ New project</button>
    </div>

    @if (editing() !== null) {
      <div class="admin-panel">
        <h2>{{ editing()!.id ? 'Edit project' : 'New project' }}</h2>
        <form class="form" style="max-width: none;" [formGroup]="form" (ngSubmit)="save()">
          <div class="form-row">
            <div class="form-field">
              <label for="title">Title</label>
              <input id="title" formControlName="title">
            </div>
            <div class="form-field">
              <label for="slug">Slug <span class="hint">(URL identifier, e.g. my-project)</span></label>
              <input id="slug" formControlName="slug">
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="role">Role</label>
              <input id="role" formControlName="role" placeholder="e.g. Full Stack Developer">
            </div>
            <div class="form-field">
              <label for="sort_order">Sort order</label>
              <input id="sort_order" type="number" formControlName="sort_order">
            </div>
          </div>
          <div class="form-field">
            <label for="summary">Summary <span class="hint">(shown on cards)</span></label>
            <textarea id="summary" formControlName="summary" rows="2"></textarea>
          </div>
          <div class="form-field">
            <label for="context">Context <span class="hint">(longer text for the detail page)</span></label>
            <textarea id="context" formControlName="context" rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="highlights">Highlights <span class="hint">(one per line)</span></label>
              <textarea id="highlights" formControlName="highlights" rows="4"></textarea>
            </div>
            <div class="form-field">
              <label for="tags">Technologies <span class="hint">(one per line)</span></label>
              <textarea id="tags" formControlName="tags" rows="4"></textarea>
            </div>
          </div>
          <div class="form-field">
            <label><input type="checkbox" formControlName="featured" style="width: auto; margin-right: 8px;">Visible on the public site</label>
          </div>

          @if (error()) {
            <div class="alert alert-error">{{ error() }}</div>
          }

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
            <button class="btn btn-ghost" type="button" (click)="cancel()">Cancel</button>
          </div>
        </form>
      </div>
    }

    @if (projects(); as list) {
      <table class="admin-table">
        <thead>
          <tr><th>Order</th><th>Title</th><th>Role</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          @for (project of list; track project.id) {
            <tr>
              <td>{{ project.sort_order }}</td>
              <td><strong>{{ project.title }}</strong><br><span class="message-meta">/{{ project.slug }}</span></td>
              <td>{{ project.role }}</td>
              <td>
                <span class="badge" [class.badge-read]="project.featured" [class.badge-hidden]="!project.featured">
                  {{ project.featured ? 'Visible' : 'Hidden' }}
                </span>
              </td>
              <td class="row-actions">
                <button class="btn btn-secondary btn-sm" (click)="startEdit(project)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="remove(project)">Delete</button>
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
export class ProjectsEditorComponent {
  private api = inject(AdminApiService);
  private fb = inject(FormBuilder);

  projects = signal<Project[] | null>(null);
  editing = signal<{ id: number | null } | null>(null);
  saving = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    role: [''],
    summary: [''],
    context: [''],
    highlights: [''],
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
    this.form.reset({ featured: true, sort_order: (this.projects()?.length ?? 0) + 1 });
    this.editing.set({ id: null });
  }

  startEdit(project: Project): void {
    this.error.set('');
    this.form.patchValue({
      ...project,
      highlights: project.highlights.join('\n'),
      tags: project.tags.join('\n'),
    });
    this.editing.set({ id: project.id });
    window.scrollTo({ top: 0 });
  }

  cancel(): void {
    this.editing.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set('');

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      highlights: raw.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: raw.tags.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    const id = this.editing()?.id;
    const request = id
      ? this.api.update<Project>('projects', id, payload)
      : this.api.create<Project>('projects', payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.status === 409 ? 'A project with this slug already exists.' : 'Saving failed.');
      },
    });
  }

  remove(project: Project): void {
    if (!confirm(`Delete "${project.title}"?`)) return;
    this.api.delete('projects', project.id).subscribe(() => this.load());
  }
}
