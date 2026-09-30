import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Employee } from '../../models/employee';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../models/leave-request';
import { EmployeeService } from '../../services/employee.service';
import { LeaveRequestService } from '../../services/leave-request.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value as string;
  const endDate = control.get('endDate')?.value as string;
  const today = new Date();
  const latest = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const latestDate = localDateString(latest);
  const earliestDate = localDateString(today);

  if ((startDate && (startDate < earliestDate || startDate > latestDate)) ||
      (endDate && (endDate < earliestDate || endDate > latestDate))) {
    return { dateOutOfRange: true };
  }

  return startDate && endDate && endDate < startDate ? { invalidDateRange: true } : null;
};

function localDateString(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

type LeaveTab = 'record' | 'pending' | 'calendar' | 'history';

interface LeaveHistoryFilters {
  employeeId: number;
  status: string;
  leaveType: string;
  month: string;
  sortOrder: 'newest' | 'oldest';
}

interface CalendarDay {
  date: string;
  dayNumber: number;
  leaves: LeaveRequest[];
}

@Component({
  selector: 'app-leave-management',
  imports: [ReactiveFormsModule, DatePickerDirective, Dropdown],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly leaveService = inject(LeaveRequestService);
  private readonly route = inject(ActivatedRoute);

  protected readonly leaveTypes: { value: LeaveType; label: string }[] = [
    { value: 'CasualLeave', label: 'Casual Leave' },
    { value: 'SickLeave', label: 'Sick Leave' },
    { value: 'PaidLeave', label: 'Paid Leave' },
    { value: 'Other', label: 'Other' },
  ];
  protected readonly statuses: LeaveStatus[] = ['Pending', 'Approved', 'Rejected'];
  protected readonly leaveTypeOptions: DropdownOption[] = this.leaveTypes;
  protected readonly historyLeaveTypeOptions: DropdownOption[] = [
    { value: '', label: 'All leave types' },
    ...this.leaveTypes,
  ];
  protected readonly historyStatusOptions: DropdownOption[] = [
    { value: '', label: 'All statuses' },
    ...this.statuses.map(status => ({ value: status, label: status })),
  ];
  protected readonly historySortOptions: DropdownOption[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
  ];
  protected readonly earliestLeaveDate = localDateString(new Date());
  protected readonly latestLeaveDate = localDateString(
    new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()),
  );
  protected readonly activeEmployees = signal<Employee[]>([]);
  protected readonly allEmployees = signal<Employee[]>([]);
  protected readonly requests = signal<LeaveRequest[]>([]);
  protected readonly activeTab = signal<LeaveTab>('record');
  protected readonly historyFilters = signal<LeaveHistoryFilters>({
    employeeId: 0,
    status: '',
    leaveType: '',
    month: '',
    sortOrder: 'newest',
  });
  protected readonly calendarMonth = signal(localDateString(new Date()).slice(0, 7));
  protected readonly pendingRequests = computed(() =>
    this.requests()
      .filter(request => request.status === 'Pending')
      .sort((first, second) => second.appliedOn.localeCompare(first.appliedOn)),
  );
  protected readonly displayedHistory = computed(() => {
    const filters = this.historyFilters();
    const direction = filters.sortOrder === 'oldest' ? 1 : -1;
    const monthStart = filters.month ? `${filters.month}-01` : '';
    const monthEnd = filters.month
      ? localDateString(new Date(Number(filters.month.slice(0, 4)), Number(filters.month.slice(5, 7)), 0))
      : '';
    return this.requests()
      .filter(request => !filters.employeeId || request.employeeId === filters.employeeId)
      .filter(request => !filters.status || request.status === filters.status)
      .filter(request => !filters.leaveType || request.leaveType.replace(' ', '') === filters.leaveType)
      .filter(request => !filters.month || (request.startDate <= monthEnd && request.endDate >= monthStart))
      .sort((first, second) => {
        const dateComparison = first.startDate.localeCompare(second.startDate) * direction;
        return dateComparison || first.employeeName.localeCompare(second.employeeName);
      });
  });
  protected readonly calendarTitle = computed(() => {
    const [year, month] = this.calendarMonth().split('-').map(Number);
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
      .format(new Date(year, month - 1, 1));
  });
  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const [year, month] = this.calendarMonth().split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const approved = this.requests().filter(request => request.status === 'Approved');
    const days: CalendarDay[] = Array.from({ length: leadingBlanks }, () => ({ date: '', dayNumber: 0, leaves: [] }));

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date,
        dayNumber: day,
        leaves: approved.filter(request => request.startDate <= date && request.endDate >= date),
      });
    }

    return days;
  });
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly updatingStatusId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected activeEmployeeOptions(): DropdownOption[] {
    return [
      { value: 0, label: 'Select active employee' },
      ...this.activeEmployees().map(employee => ({ value: employee.id, label: employee.name })),
    ];
  }

  protected historyEmployeeOptions(): DropdownOption[] {
    return [
      { value: 0, label: 'All employees' },
      ...this.allEmployees().map(employee => ({
        value: employee.id,
        label: `${employee.name}${employee.isActive ? '' : ' (Relieved)'}`,
      })),
    ];
  }

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
    month: [''],
    sortOrder: ['newest'],
  });

  ngOnInit(): void {
    const requestedTab = this.route.snapshot.queryParamMap.get('tab');
    if (requestedTab === 'pending' || requestedTab === 'calendar' || requestedTab === 'history' || requestedTab === 'record') {
      this.activeTab.set(requestedTab);
    }
    forkJoin({ employees: this.employeeService.getEmployees(), requests: this.leaveService.getLeaveRequests() })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ employees, requests }) => {
          this.allEmployees.set(employees);
          this.activeEmployees.set(employees.filter(employee => employee.isActive));
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
        this.loadRequests();
      },
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(error.error?.message ?? 'Leave request could not be saved.'),
    });
  }

  protected editRequest(request: LeaveRequest): void {
    this.activeTab.set('record');
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
          this.loadRequests();
        },
        error: (error: HttpErrorResponse) => {
          const message = error.status === 0
            ? 'The API connection was interrupted. Confirm the backend is running on http://localhost:5090, then refresh this page and try again.'
            : error.error?.message ?? 'Leave status could not be updated.';
          this.errorMessage.set(message);
        },
      });
  }

  protected applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.historyFilters.set({
      employeeId: filters.employeeId,
      status: filters.status,
      leaveType: filters.leaveType,
      month: filters.month,
      sortOrder: filters.sortOrder as 'newest' | 'oldest',
    });
  }

  protected clearFilters(): void {
    this.filterForm.reset({ employeeId: 0, status: '', leaveType: '', month: '', sortOrder: 'newest' });
    this.historyFilters.set({ employeeId: 0, status: '', leaveType: '', month: '', sortOrder: 'newest' });
  }

  protected selectTab(tab: LeaveTab): void {
    if (tab !== 'record' && this.editingId() !== null) this.cancelEdit();
    this.activeTab.set(tab);
    this.clearMessages();
  }

  protected moveCalendarMonth(offset: number): void {
    const [year, month] = this.calendarMonth().split('-').map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    this.calendarMonth.set(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  protected showCurrentMonth(): void {
    this.calendarMonth.set(localDateString(new Date()).slice(0, 7));
  }

  protected changeCalendarMonth(event: Event): void {
    const month = (event.target as HTMLInputElement).value;
    if (month) this.calendarMonth.set(month);
  }

  protected isToday(date: string): boolean {
    return date === localDateString(new Date());
  }

  protected isEmployeeActive(employeeId: number): boolean {
    return this.allEmployees().find(employee => employee.id === employeeId)?.isActive ?? false;
  }

  protected isValidLeaveDates(request: LeaveRequest): boolean {
    return request.startDate >= this.earliestLeaveDate &&
      request.endDate <= this.latestLeaveDate &&
      request.endDate >= request.startDate;
  }

  private loadRequests(): void {
    this.isLoading.set(true);
    this.leaveService.getLeaveRequests()
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
