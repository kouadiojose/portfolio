import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

const TOKEN_KEY = 'portfolio_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly isLoggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>('/api/auth/login', { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this.isLoggedIn.set(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/admin/login']);
  }

  changePassword(current_password: string, new_password: string) {
    return this.http.post<void>('/api/auth/change-password', { current_password, new_password });
  }
}
