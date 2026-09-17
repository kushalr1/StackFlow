import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5090/api/auth';
  private readonly tokenKey = 'stackflow_admin_token';
  private readonly emailKey = 'stackflow_admin_email';

  readonly isAuthenticated = signal(this.hasValidToken());
  readonly adminEmail = signal(sessionStorage.getItem(this.emailKey) ?? '');

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        sessionStorage.setItem(this.tokenKey, response.token);
        sessionStorage.setItem(this.emailKey, response.email);
        this.adminEmail.set(response.email);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.emailKey);
    this.adminEmail.set('');
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    if (!this.hasValidToken()) {
      this.logout();
      return null;
    }

    return sessionStorage.getItem(this.tokenKey);
  }

  private hasValidToken(): boolean {
    const token = sessionStorage.getItem(this.tokenKey);

    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
