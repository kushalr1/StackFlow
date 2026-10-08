import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmployeeDashboard } from './employee-dashboard';

describe('EmployeeDashboard', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [EmployeeDashboard],
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  }));

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('shows own summaries and excludes completed or removed assignments from current projects', () => {
    const fixture = TestBed.createComponent(EmployeeDashboard);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/employee/profile').flush({ name: 'Employee A', jobTitle: 'Developer', department: 'Engineering', isActive: true });
    http.expectOne(request => request.url === '/api/employee/attendance').flush([{ date: '2026-10-01', status: 'Present' }]);
    http.expectOne('/api/employee/leaves').flush([{ id: 1, leaveType: 'Sick Leave', status: 'Pending', startDate: '2026-10-06', endDate: '2026-10-06' }]);
    http.expectOne('/api/employee/projects').flush([
      { id: 1, name: 'Current assignment', status: 'Active', role: 'Developer', removedOn: null },
      { id: 2, name: 'Completed assignment', status: 'Completed', removedOn: null },
      { id: 3, name: 'Removed assignment', status: 'Active', removedOn: '2026-10-01' },
    ]);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Welcome, Employee A');
    expect(text).toContain('Current assignment');
    expect(text).not.toContain('Completed assignment');
    expect(text).not.toContain('Removed assignment');
    expect(fixture.nativeElement.querySelector('a[href="/employee/attendance"]')).toBeTruthy();
  });

  it('keeps other sections available when one API fails and does not show misleading zero counts', () => {
    const fixture = TestBed.createComponent(EmployeeDashboard);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/employee/profile').flush({ name: 'Employee A', isActive: true });
    http.expectOne(request => request.url === '/api/employee/attendance').flush('Unavailable', { status: 500, statusText: 'Server Error' });
    http.expectOne('/api/employee/leaves').flush([]);
    http.expectOne('/api/employee/projects').flush([]);
    fixture.detectChanges();
    const attendanceCard = fixture.nativeElement.querySelector('a[href="/employee/attendance"]');
    expect(attendanceCard.textContent).toContain('Attendance unavailable');
    expect(attendanceCard.querySelector('.count')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No current project assignments.');
  });
});
