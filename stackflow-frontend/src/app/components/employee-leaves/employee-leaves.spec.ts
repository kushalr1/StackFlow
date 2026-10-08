import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmployeeLeaves } from './employee-leaves';

describe('EmployeeLeaves month history', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [EmployeeLeaves], providers: [provideHttpClient(), provideHttpClientTesting()],
  }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('includes cross-month leave and counts only approved days inside selected month', () => {
    const fixture = TestBed.createComponent(EmployeeLeaves); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/employee/leaves').flush([
      { id: 1, leaveType: 'Paid Leave', status: 'Approved', startDate: '2026-09-29', endDate: '2026-10-02', totalDays: 4, reason: 'Cross-month request' },
      { id: 2, leaveType: 'Sick Leave', status: 'Rejected', startDate: '2026-08-01', endDate: '2026-08-02', totalDays: 2, reason: 'August request' },
    ]);
    fixture.detectChanges();
    const month = fixture.nativeElement.querySelector('#history-month') as HTMLInputElement;
    month.value = '2026-10'; month.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('.filters').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.days strong').textContent).toBe('2');
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Cross-month request');
    expect(fixture.nativeElement.querySelector('tbody').textContent).not.toContain('August request');
    const clear = fixture.nativeElement.querySelector('.filters .secondary') as HTMLButtonElement;
    clear.click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.days strong').textContent).toBe('4');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });
});
