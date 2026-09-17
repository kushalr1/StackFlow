import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should store the token after successful login', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const token = `header.${payload}.signature`;

    service.login({ email: 'admin@stackflow.local', password: 'password' }).subscribe();
    const request = httpTesting.expectOne('http://localhost:5090/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({ token, expiresAt: new Date(Date.now() + 3600000).toISOString(), email: 'admin@stackflow.local' });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe(token);
  });

  it('should clear authentication state on logout', () => {
    sessionStorage.setItem('stackflow_admin_token', 'token');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('stackflow_admin_token')).toBeNull();
  });
});
