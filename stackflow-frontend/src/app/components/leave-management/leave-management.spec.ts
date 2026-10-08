import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WritableSignal } from '@angular/core';
import { LeaveManagement } from './leave-management';
import { LeaveRequest } from '../../models/leave-request';
import { Employee } from '../../models/employee';

describe('Admin leave decisions', () => {
  it('starts on pending approvals with no create or edit controls', () => {
    TestBed.configureTestingModule({
      imports: [LeaveManagement],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(LeaveManagement);
    const component = fixture.componentInstance as unknown as {
      requests: WritableSignal<LeaveRequest[]>;
      allEmployees: WritableSignal<Employee[]>;
      isLoading: WritableSignal<boolean>;
      earliestLeaveDate: string;
    };
    component.isLoading.set(false);
    component.allEmployees.set([{ id: 1, isActive: true }] as Employee[]);
    component.requests.set([{
      id: 1, employeeId: 1, employeeName: 'Employee', status: 'Pending',
      leaveType: 'Casual Leave', reason: 'Family event', appliedOn: '2026-01-01',
      startDate: component.earliestLeaveDate, endDate: component.earliestLeaveDate,
    }] as LeaveRequest[]);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Approve');
    expect(text).toContain('Reject');
    expect(text).not.toContain('Record Request');
    expect(text).not.toContain('Edit');
    expect(fixture.nativeElement.querySelector('.request-form')).toBeNull();
  });
});
