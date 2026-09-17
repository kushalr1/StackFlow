import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LeaveRequestService } from './leave-request.service';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LeaveRequestService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends leave filters', () => {
    service.getLeaveRequests(2, 'Pending', 'SickLeave').subscribe();
    const request = http.expectOne(
      'http://localhost:5090/api/leaves?employeeId=2&status=Pending&leaveType=SickLeave',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('approves a leave request through the status endpoint', () => {
    service.updateStatus(4, 'Approved').subscribe();
    const request = http.expectOne('http://localhost:5090/api/leaves/4/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'Approved' });
    request.flush(null);
  });
});
