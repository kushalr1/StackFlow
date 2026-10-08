import { DatePipe } from '@angular/common';
import { InitialCapitalDirective } from '../../directives/initial-capital.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmployeeLeave, EmployeeLeaveStatus, EmployeeLeaveType } from '../../models/employee-leave';
import { EmployeeLeaveService } from '../../services/employee-leave.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

@Component({
  imports: [DatePipe, ReactiveFormsModule, DatePickerDirective, Dropdown, InitialCapitalDirective],
  selector: 'app-employee-leaves',
  templateUrl: './employee-leaves.html',
  styleUrl: './employee-leaves.css',
})
export class EmployeeLeaves implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly leaveService = inject(EmployeeLeaveService);

  protected readonly leaves = signal<EmployeeLeave[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly minDate = this.today();
  protected readonly maxDate = this.oneYearFromToday();
  protected readonly leaveTypeOptions: DropdownOption[] = [
    { value: 'CasualLeave', label: 'Casual Leave' },
    { value: 'SickLeave', label: 'Sick Leave' },
    { value: 'PaidLeave', label: 'Paid Leave' },
    { value: 'Other', label: 'Other' },
  ];
  protected readonly statusOptions: DropdownOption[] = [
    { value: '', label: 'All decisions' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
  ];
  protected readonly requestForm = this.formBuilder.nonNullable.group({
    leaveType: ['CasualLeave' as EmployeeLeaveType, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });
  protected readonly filterForm = this.formBuilder.nonNullable.group({ status: [''], month: [''] });
  protected readonly appliedFilter = signal({ status: '', month: '' });
  protected readonly monthlyLeaves = computed(() => {
    const month = this.appliedFilter().month;
    return month ? this.leaves().filter(leave => this.daysInMonth(leave, month) > 0) : this.leaves();
  });
  protected readonly displayedLeaves = computed(() => {
    const status = this.appliedFilter().status as EmployeeLeaveStatus | '';
    return (status ? this.monthlyLeaves().filter(leave => leave.status === status) : this.monthlyLeaves())
      .slice().sort((left, right) => right.startDate.localeCompare(left.startDate) || right.id - left.id);
  });
  protected readonly summary = computed(() => ({
    pending: this.monthlyLeaves().filter(leave => leave.status === 'Pending').length,
    approved: this.monthlyLeaves().filter(leave => leave.status === 'Approved').length,
    rejected: this.monthlyLeaves().filter(leave => leave.status === 'Rejected').length,
    approvedDays: this.monthlyLeaves()
      .filter(leave => leave.status === 'Approved')
      .reduce((total, leave) => total + (this.appliedFilter().month
        ? this.daysInMonth(leave, this.appliedFilter().month) : leave.totalDays), 0),
  }));

  ngOnInit(): void {
    this.loadLeaves();
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const request = this.requestForm.getRawValue();
    if (request.endDate < request.startDate) {
      this.errorMessage.set('End date cannot be before start date.');
      return;
    }

    this.isSaving.set(true);
    this.leaveService.createLeave(request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Leave request submitted for Admin/HR approval.');
          this.requestForm.reset({ leaveType: 'CasualLeave', startDate: '', endDate: '', reason: '' });
          this.loadLeaves();
        },
        error: (error: HttpErrorResponse) =>
          this.errorMessage.set(error.error?.message ?? 'Leave request could not be submitted.'),
      });
  }

  protected applyFilter(): void {
    this.appliedFilter.set(this.filterForm.getRawValue());
  }

  protected clearFilter(): void {
    this.filterForm.setValue({ status: '', month: '' });
    this.applyFilter();
  }

  private daysInMonth(leave: EmployeeLeave, month: string): number {
    const [year, number] = month.split('-').map(Number);
    const start = Date.UTC(year, number - 1, 1);
    const end = Date.UTC(year, number, 1) - 86400000;
    const overlapStart = Math.max(start, Date.parse(leave.startDate));
    const overlapEnd = Math.min(end, Date.parse(leave.endDate));
    return Math.max(0, Math.floor((overlapEnd - overlapStart) / 86400000) + 1);
  }

  protected statusClass(status: string): string {
    return status.toLowerCase();
  }

  private loadLeaves(): void {
    this.isLoading.set(true);
    this.leaveService.getLeaves()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: leaves => this.leaves.set(leaves),
        error: () => this.errorMessage.set('Your leave history could not be loaded.'),
      });
  }

  private today(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  private oneYearFromToday(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
}
