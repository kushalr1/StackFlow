import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('loads aggregated dashboard statistics', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(DashboardService);
    const http = TestBed.inject(HttpTestingController);
    service.getStats().subscribe();
    const request = http.expectOne('/api/dashboard/stats');
    expect(request.request.method).toBe('GET');
    request.flush({ totalEmployees: 7, activeEmployees: 7, relievedEmployees: 0,
      presentToday: 0, absentToday: 0, onLeaveToday: 0,
      pendingLeaveRequests: 0, totalDepartments: 6, activeProjects: 1 });
    http.verify();
  });
});
