import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Employee } from '../../models/employee';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../models/leave-request';
import { EmployeeService } from '../../services/employee.service';
import { LeaveRequestService } from '../../services/leave-request.service';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string;
  const endDate = control.get('endDate')?.value as string;
  return startDate && endDate && endDate < startDate ? { invalidDateRange: true } : null;
};

@Component({
  selector: 'app-leave-management',
  imports: [ReactiveFormsModule],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly leaveService = inject(LeaveRequestService);

  protected readonly leaveTypes: { value: LeaveType; label: string }[] = [
    { value: 'CasualLeave', label: 'Casual Leave' },
    { value: 'SickLeave', label: 'Sick Leave' },
    { value: 'PaidLeave', label: 'Paid Leave' },
    { value: 'Other', label: 'Other' },
  ];
  protected readonly statuses: LeaveStatus[] = ['Pending', 'Approved', 'Rejected'];
  protected readonly employees = signal<Employee[]>([]);
  protected readonly requests = signal<LeaveRequest[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly updatingStatusId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly leaveForm = this.formBuilder.nonNullable.group({
    employeeId: [0, Validators.min(1)],
    leaveType: ['CasualLeave' as LeaveType, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(5), Validators.maxLength(500)]],
  }, { validators: dateRangeValidator });

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    employeeId: [0],
    status: [''],
    leaveType: [''],
  });

  ngOnInit(): void {
    forkJoin({ employees: this.employeeService.getEmployees(), requests: this.leaveService.getLeaveRequests() })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ employees, requests }) => {
          this.employees.set(employees.filter(employee => employee.isActive));
          this.requests.set(requests);
        },
        error: () => this.errorMessage.set('Leave request information could not be loaded.'),
      });
  }

  protected saveRequest(): void {
    this.clearMessages();
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const raw = this.leaveForm.getRawValue();
    const request = { ...raw, reason: raw.reason.trim() };
    const editingId = this.editingId();
    const operation: Observable<LeaveRequest | void> = editingId === null
      ? this.leaveService.createLeaveRequest(request)
      : this.leaveService.updateLeaveRequest(editingId, request);

    this.isSaving.set(true);
    operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.successMessage.set(editingId === null ? 'Leave request recorded successfully.' : 'Leave request updated successfully.');
        this.cancelEdit();
        this.applyFilters();
      },
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(error.error?.message ?? 'Leave request could not be saved.'),
    });
  }

  protected editRequest(request: LeaveRequest): void {
    this.editingId.set(request.id);
    this.clearMessages();
    this.leaveForm.setValue({
      employeeId: request.employeeId,
      leaveType: request.leaveType.replace(' ', '') as LeaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.leaveForm.reset({ employeeId: 0, leaveType: 'CasualLeave', startDate: '', endDate: '', reason: '' });
  }

  protected changeStatus(request: LeaveRequest, status: 'Approved' | 'Rejected'): void {
    this.clearMessages();
    this.updatingStatusId.set(request.id);
    this.leaveService.updateStatus(request.id, status)
      .pipe(finalize(() => this.updatingStatusId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(`Leave request ${status.toLowerCase()}.`);
          this.applyFilters();
        },
        error: (error: HttpErrorResponse) =>
          this.errorMessage.set(error.error?.message ?? 'Leave status could not be updated.'),
      });
  }

  protected applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.loadRequests(filters.employeeId || undefined, filters.status, filters.leaveType);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ employeeId: 0, status: '', leaveType: '' });
    this.loadRequests();
  }

  private loadRequests(employeeId?: number, status?: string, leaveType?: string): void {
    this.isLoading.set(true);
    this.leaveService.getLeaveRequests(employeeId, status, leaveType)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: requests => this.requests.set(requests),
        error: () => this.errorMessage.set('Leave requests could not be loaded.'),
      });
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
