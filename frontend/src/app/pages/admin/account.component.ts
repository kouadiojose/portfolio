import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';

/** Admin account management: login email and password. */
@Component({
  selector: 'app-admin-account',
  imports: [ReactiveFormsModule],
  template: `
    <h1>Account</h1>
    <p class="admin-sub">Your admin credentials. Signed in as <strong>{{ currentEmail() || '…' }}</strong></p>

    <div class="admin-panel">
      <h2>Login email</h2>
      <form class="form" [formGroup]="emailForm" (ngSubmit)="changeEmail()">
        <div class="form-row">
          <div class="form-field">
            <label>New email</label>
            <input type="email" formControlName="new_email" autocomplete="username">
          </div>
          <div class="form-field">
            <label>Current password <span class="hint">(required to confirm)</span></label>
            <input type="password" formControlName="password" autocomplete="current-password">
          </div>
        </div>
        @if (emailMessage()) {
          <div class="alert" [class.alert-success]="emailOk()" [class.alert-error]="!emailOk()">
            {{ emailMessage() }}
          </div>
        }
        <div>
          <button class="btn btn-primary" type="submit" [disabled]="emailForm.invalid || busy()">
            Update email
          </button>
        </div>
      </form>
    </div>

    <div class="admin-panel">
      <h2>Password</h2>
      <form class="form" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
        <div class="form-row">
          <div class="form-field">
            <label>Current password</label>
            <input type="password" formControlName="current_password" autocomplete="current-password">
          </div>
          <div class="form-field">
            <label>New password <span class="hint">(min. 8 characters)</span></label>
            <input type="password" formControlName="new_password" autocomplete="new-password">
          </div>
        </div>
        @if (passwordMessage()) {
          <div class="alert" [class.alert-success]="passwordOk()" [class.alert-error]="!passwordOk()">
            {{ passwordMessage() }}
          </div>
        }
        <div>
          <button class="btn btn-primary" type="submit" [disabled]="passwordForm.invalid || busy()">
            Update password
          </button>
        </div>
      </form>
    </div>

    <div class="admin-panel">
      <h2>Good to know</h2>
      <p style="color: var(--text-2); font-size: 14px;">
        Credentials live in the database — changes apply immediately and survive redeployments.
        The <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD</code> environment variables are only
        used to create the very first account when the database is empty.
      </p>
    </div>
  `,
})
export class AccountComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  currentEmail = signal('');
  busy = signal(false);
  emailMessage = signal('');
  emailOk = signal(false);
  passwordMessage = signal('');
  passwordOk = signal(false);

  emailForm = this.fb.nonNullable.group({
    new_email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.auth.me().subscribe((me) => this.currentEmail.set(me.email));
  }

  changeEmail(): void {
    if (this.emailForm.invalid) return;
    this.busy.set(true);
    const { new_email, password } = this.emailForm.getRawValue();
    this.auth.changeEmail(password, new_email).subscribe({
      next: () => {
        this.busy.set(false);
        this.emailOk.set(true);
        this.emailMessage.set(`Email updated — you are now signed in as ${new_email}.`);
        this.currentEmail.set(new_email);
        this.emailForm.reset();
      },
      error: (err) => {
        this.busy.set(false);
        this.emailOk.set(false);
        this.emailMessage.set(
          err.status === 400
            ? 'Password is incorrect.'
            : err.status === 409
              ? 'This email is already in use.'
              : 'Email update failed. Please retry.'
        );
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.busy.set(true);
    const { current_password, new_password } = this.passwordForm.getRawValue();
    this.auth.changePassword(current_password, new_password).subscribe({
      next: () => {
        this.busy.set(false);
        this.passwordOk.set(true);
        this.passwordMessage.set('Password updated.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.busy.set(false);
        this.passwordOk.set(false);
        this.passwordMessage.set(
          err.status === 400 ? 'Current password is incorrect.' : 'Password update failed.'
        );
      },
    });
  }
}
