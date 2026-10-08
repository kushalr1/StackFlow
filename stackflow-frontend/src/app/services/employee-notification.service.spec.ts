import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmployeeNotificationService } from './employee-notification.service';

describe('Employee notifications', () => {
  it('loads the owned inbox and marks a notification read without sending employee ID', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(EmployeeNotificationService);
    const http = TestBed.inject(HttpTestingController);
    service.refresh().subscribe();
    http.expectOne('/api/employee/notifications').flush({ unreadCount: 1, items: [] });
    expect(service.inbox()?.unreadCount).toBe(1);
    service.markRead(8).subscribe();
    const request = http.expectOne('/api/employee/notifications/8/read');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    request.flush(null);
    http.verify();
  });
});
