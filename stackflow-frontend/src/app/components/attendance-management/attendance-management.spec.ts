import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WritableSignal } from '@angular/core';
import { AttendanceManagement } from './attendance-management';
import { Attendance } from '../../models/attendance';
import { Employee } from '../../models/employee';

describe('Attendance history action labels', () => {
  it('explains locked records while keeping today editable for active employees', () => {
    TestBed.configureTestingModule({
      imports: [AttendanceManagement],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(AttendanceManagement);
    const component = fixture.componentInstance as unknown as {
      activeTab: WritableSignal<'mark' | 'history'>;
      allEmployees: WritableSignal<Employee[]>;
      records: WritableSignal<Attendance[]>;
      isLoading: WritableSignal<boolean>;
      attendanceForm: { controls: { date: { value: string } } };
    };
    component.activeTab.set('history');
    component.isLoading.set(false);
    component.allEmployees.set([{ id: 1, isActive: true }, { id: 2, isActive: false }] as Employee[]);
    const today = component.attendanceForm.controls.date.value;
    component.records.set([
      { id: 1, employeeId: 1, employeeName: 'Active today', date: today, status: 'Present' },
      { id: 2, employeeId: 1, employeeName: 'Active history', date: '2000-01-01', status: 'Present' },
      { id: 3, employeeId: 2, employeeName: 'Relieved', date: today, status: 'Present' },
    ] as Attendance[]);
    fixture.detectChanges();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rows.find(row => row.textContent?.includes('Active today'))?.querySelector('button')?.textContent).toContain('Edit Status');
    expect(rows.find(row => row.textContent?.includes('Active history'))?.textContent).toContain("Read-only · Not today's record");
    expect(rows.find(row => row.textContent?.includes('Relieved'))?.textContent).toContain('Read-only · Relieved employee');
    expect(fixture.nativeElement.textContent).not.toContain('History only');
  });
});
