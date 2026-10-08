import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserRole } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'stackflow_token';
  private readonly emailKey = 'stackflow_email';
  private readonly roleKey = 'stackflow_role';
  private readonly employeeIdKey = 'stackflow_employee_id';

  readonly isAuthenticated = signal(this.hasValidSession());
  readonly email = signal(sessionStorage.getItem(this.emailKey) ?? '');
  readonly role = signal<UserRole | null>(this.readRole());
  readonly employeeId = signal<number | null>(this.readEmployeeId());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        sessionStorage.setItem(this.tokenKey, response.token);
        sessionStorage.setItem(this.emailKey, response.email);
        sessionStorage.setItem(this.roleKey, response.role);
        if (response.employeeId === null) {
          sessionStorage.removeItem(this.employeeIdKey);
        } else {
          sessionStorage.setItem(this.employeeIdKey, response.employeeId.toString());
        }
        this.email.set(response.email);
        this.role.set(response.role);
        this.employeeId.set(response.employeeId);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.emailKey);
    sessionStorage.removeItem(this.roleKey);
    sessionStorage.removeItem(this.employeeIdKey);
    this.email.set('');
    this.role.set(null);
    this.employeeId.set(null);
    this.isAuthenticated.set(false);
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.role() === role;
  }

  homeUrl(): string {
    return this.role() === 'Employee' ? '/employee' : '/dashboard';
  }

  private readRole(): UserRole | null {
    const role = sessionStorage.getItem(this.roleKey);
    return role === 'Admin' || role === 'Employee' ? role : null;
  }

  private readEmployeeId(): number | null {
    const value = sessionStorage.getItem(this.employeeIdKey);
    if (value === null) {
      return null;
    }

    const employeeId = Number(value);
    return Number.isInteger(employeeId) ? employeeId : null;
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

  private hasValidSession(): boolean {
    return this.hasValidToken() && this.readRole() !== null;
  }
}
