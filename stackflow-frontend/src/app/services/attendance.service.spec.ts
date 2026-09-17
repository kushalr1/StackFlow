import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AttendanceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends date, employee and status filters', () => {
    service.getAttendance('2026-09-17', 2, 'Present').subscribe();

    const request = http.expectOne(
      'http://localhost:5090/api/attendance?date=2026-09-17&employeeId=2&status=Present',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates an attendance record', () => {
    const attendance = { employeeId: 2, date: '2026-09-17', status: 'Present' as const };
    service.createAttendance(attendance).subscribe();

    const request = http.expectOne('http://localhost:5090/api/attendance');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(attendance);
    request.flush({ id: 1, employeeName: 'Kushal', ...attendance });
  });
});
