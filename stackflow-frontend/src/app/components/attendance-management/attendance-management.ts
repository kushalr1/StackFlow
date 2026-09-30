import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Attendance, AttendanceStatus } from '../../models/attendance';
import { Employee } from '../../models/employee';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

@Component({
  selector: 'app-attendance-management',
  imports: [ReactiveFormsModule, DatePickerDirective, Dropdown],
  templateUrl: './attendance-management.html',
  styleUrl: './attendance-management.css',
})
export class AttendanceManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);

  protected readonly statuses: { value: AttendanceStatus; label: string }[] = [
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'HalfDay', label: 'Half Day' },
  ];
  protected readonly attendanceStatusOptions: DropdownOption[] = this.statuses;
  protected readonly historyStatusOptions: DropdownOption[] = [
    { value: '', label: 'All statuses' },
    ...this.statuses,
  ];
  protected readonly sortOptions: DropdownOption[] = [
    { value: 'newest', label: 'Newest date first' },
    { value: 'oldest', label: 'Oldest date first' },
  ];
  protected readonly activeEmployees = signal<Employee[]>([]);
  protected readonly allEmployees = signal<Employee[]>([]);
  protected readonly records = signal<Attendance[]>([]);
  protected readonly sortOrder = signal<'newest' | 'oldest'>('newest');
  protected readonly displayedRecords = computed(() => {
    const direction = this.sortOrder() === 'oldest' ? 1 : -1;
    return [...this.records()].sort((first, second) => {
      const dateComparison = first.date.localeCompare(second.date) * direction;
      return dateComparison || first.employeeName.localeCompare(second.employeeName);
    });
  });
  protected readonly activeTab = signal<'mark' | 'history'>('mark');
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
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

  protected readonly attendanceForm = this.formBuilder.nonNullable.group({
    employeeId: [0, Validators.min(1)],
    date: [this.today(), Validators.required],
    status: ['Present' as AttendanceStatus, Validators.required],
  });

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    date: [''],
    employeeId: [0],
    status: [''],
    sortOrder: ['newest'],
  });

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const date = query.get('date') === 'today' ? this.today() : query.get('date') ?? '';
    const status = query.get('status') ?? '';
    if (query.get('tab') === 'history') this.activeTab.set('history');
    this.filterForm.patchValue({ date, status });

    forkJoin({ employees: this.employeeService.getEmployees(), records: this.attendanceService.getAttendance(date, undefined, status) })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ employees, records }) => {
          this.allEmployees.set(employees);
          this.activeEmployees.set(employees.filter(employee => employee.isActive));
          this.records.set(records);
        },
        error: () => this.errorMessage.set('Attendance information could not be loaded.'),
      });
  }

  protected applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.sortOrder.set(filters.sortOrder as 'newest' | 'oldest');
    this.loadRecords(filters.date, filters.employeeId || undefined, filters.status);
  }

  protected selectTab(tab: 'mark' | 'history'): void {
    if (tab === 'history' && this.editingId() !== null) this.cancelEdit();
    this.activeTab.set(tab);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected clearFilters(): void {
    this.filterForm.reset({ date: '', employeeId: 0, status: '', sortOrder: 'newest' });
    this.sortOrder.set('newest');
    this.loadRecords();
  }

  protected saveAttendance(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const request = this.attendanceForm.getRawValue();
    const editingId = this.editingId();
    const operation: Observable<Attendance | void> = editingId === null
      ? this.attendanceService.createAttendance(request)
      : this.attendanceService.updateAttendance(editingId, request);

    this.isSaving.set(true);
    operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.successMessage.set(editingId === null ? 'Attendance saved successfully.' : 'Attendance updated successfully.');
        this.cancelEdit();
        this.applyFilters();
      },
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(error.error?.message ?? 'Attendance could not be saved.'),
    });
  }

  protected editAttendance(record: Attendance): void {
    if (!this.isEmployeeActive(record.employeeId)) return;

    const status = record.status.replace(' ', '') as AttendanceStatus;
    this.activeTab.set('mark');
    this.editingId.set(record.id);
    this.attendanceForm.setValue({ employeeId: record.employeeId, date: record.date, status });
    this.attendanceForm.controls.employeeId.disable();
    this.attendanceForm.controls.date.disable();
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.attendanceForm.controls.employeeId.enable();
    this.attendanceForm.controls.date.enable();
    this.attendanceForm.reset({ employeeId: 0, date: this.today(), status: 'Present' });
  }

  protected statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  protected isEmployeeActive(employeeId: number): boolean {
    return this.allEmployees().find(employee => employee.id === employeeId)?.isActive ?? false;
  }

  protected isToday(date: string): boolean {
    return date === this.today();
  }

  private loadRecords(date?: string, employeeId?: number, status?: string): void {
    this.isLoading.set(true);
    this.attendanceService.getAttendance(date, employeeId, status)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: records => this.records.set(records),
        error: () => this.errorMessage.set('Attendance records could not be loaded.'),
      });
  }

  private today(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }
}
