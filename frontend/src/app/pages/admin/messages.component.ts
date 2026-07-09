import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { AdminApiService } from '../../core/admin-api.service';
import { ContactMessage } from '../../core/models';

@Component({
  selector: 'app-admin-messages',
  imports: [DatePipe],
  template: `
    <h1>Inbox</h1>
    <p class="admin-sub">Messages sent through the contact form.</p>

    @if (messages(); as list) {
      @if (!list.length) {
        <div class="empty-state">No messages yet.</div>
      }
      @for (message of list; track message.id) {
        <div class="message-card">
          <div class="message-head">
            <div>
              <strong>{{ message.name }}</strong>
              <span class="message-meta"> · {{ message.email }}</span>
            </div>
            <div>
              <span class="badge badge-lang">{{ message.language === 'fr' ? 'Français' : 'English' }}</span>
              <span class="badge" [class.badge-new]="!message.read" [class.badge-read]="message.read">
                {{ message.read ? 'Read' : 'New' }}
              </span>
              <span class="message-meta"> {{ message.created_at | date: 'medium' }}</span>
            </div>
          </div>
          @if (message.subject) {
            <div><strong style="font-size: 14px;">{{ message.subject }}</strong></div>
          }
          <p class="message-body">{{ message.body }}</p>
          <div class="row-actions" style="display: flex; gap: 8px;">
            <a class="btn btn-secondary btn-sm" [href]="'mailto:' + message.email">Reply by email</a>
            @if (!message.read) {
              <button class="btn btn-ghost btn-sm" (click)="markRead(message)">Mark as read</button>
            }
            <button class="btn btn-danger btn-sm" (click)="remove(message)">Delete</button>
          </div>
        </div>
      }
    } @else {
      <div class="loading-state"><div class="spinner"></div>Loading…</div>
    }
  `,
})
export class MessagesComponent {
  private api = inject(AdminApiService);
  messages = signal<ContactMessage[] | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listMessages().subscribe((list) => this.messages.set(list));
  }

  markRead(message: ContactMessage): void {
    this.api.markRead(message.id).subscribe((updated) => {
      this.messages.update((list) => (list ?? []).map((m) => (m.id === updated.id ? updated : m)));
    });
  }

  remove(message: ContactMessage): void {
    if (!confirm(`Delete the message from ${message.name}?`)) return;
    this.api.deleteMessage(message.id).subscribe(() => {
      this.messages.update((list) => (list ?? []).filter((m) => m.id !== message.id));
    });
  }
}
