import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';
import { vi } from 'vitest';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => { sessionStorage.clear(); vi.useRealTimers(); });

  it('refreshes Admin alerts and stops requests after logout', async () => {
    vi.useFakeTimers();
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('stackflow_token', `header.${payload}.signature`);
    sessionStorage.setItem('stackflow_role', 'Admin');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    await vi.advanceTimersByTimeAsync(0);
    http.expectOne('/api/dashboard/stats').flush({ pendingLeaveRequests: 2 });
    expect(TestBed.inject(DashboardService).pendingLeaves()).toBe(2);
    await vi.advanceTimersByTimeAsync(30_000);
    http.expectOne('/api/dashboard/stats').flush({ pendingLeaveRequests: 1 });
    TestBed.inject(AuthService).logout();
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(30_000);
    http.expectNone('/api/dashboard/stats');
    expect(TestBed.inject(DashboardService).pendingLeaves()).toBeNull();
    fixture.destroy();
    http.verify();
  });

  it('does not request Admin statistics for an Employee session', async () => {
    vi.useFakeTimers();
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('stackflow_token', `header.${payload}.signature`);
    sessionStorage.setItem('stackflow_role', 'Employee');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(30_000);
    TestBed.inject(HttpTestingController).expectNone('/api/dashboard/stats');
    const bell = fixture.nativeElement.querySelector('.notification-bell');
    expect(bell.getAttribute('aria-label')).toBe('Notifications');
    expect(bell.querySelector('svg')).not.toBeNull();
    expect(bell.textContent.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('.pending-badge')).toBeNull();
    fixture.destroy();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should provide a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the primary navigation links', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('stackflow_token', `header.${payload}.signature`);
    sessionStorage.setItem('stackflow_email', 'admin@stackflow.local');
    sessionStorage.setItem('stackflow_role', 'Admin');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('nav > *');

    expect(items).toHaveLength(7);
    const dashboard = TestBed.inject(DashboardService);
    dashboard.pendingLeaves.set(3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pending-badge')?.textContent).toContain('3');
    dashboard.pendingLeaves.set(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pending-badge')).toBeNull();
  });
});
