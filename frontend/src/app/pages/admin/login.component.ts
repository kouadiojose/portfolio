import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="admin-login-wrap">
      <div class="admin-login-card">
        <h1>Admin</h1>
        <p>Sign in to manage the portfolio content.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="username">
          </div>
          <div class="form-field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password">
          </div>

          @if (error()) {
            <div class="alert alert-error" role="alert">{{ error() }}</div>
          }

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.status === 401 ? 'Invalid email or password.' : 'Login failed. Please retry.');
      },
    });
  }
}
