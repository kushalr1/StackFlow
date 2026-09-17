import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Attendance, AttendanceStatus } from '../../models/attendance';
import { Employee } from '../../models/employee';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-attendance-management',
  imports: [ReactiveFormsModule],
  templateUrl: './attendance-management.html',
  styleUrl: './attendance-management.css',
})
export class AttendanceManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly employeeService = inject(EmployeeService);

  protected readonly statuses: { value: AttendanceStatus; label: string }[] = [
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'HalfDay', label: 'Half Day' },
    { value: 'OnLeave', label: 'On Leave' },
  ];
  protected readonly employees = signal<Employee[]>([]);
  protected readonly records = signal<Attendance[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly attendanceForm = this.formBuilder.nonNullable.group({
    employeeId: [0, Validators.min(1)],
    date: [this.today(), Validators.required],
    status: ['Present' as AttendanceStatus, Validators.required],
  });

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    date: [''],
    employeeId: [0],
    status: [''],
  });

  ngOnInit(): void {
    forkJoin({ employees: this.employeeService.getEmployees(), records: this.attendanceService.getAttendance() })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ employees, records }) => {
          this.employees.set(employees.filter(employee => employee.isActive));
          this.records.set(records);
        },
        error: () => this.errorMessage.set('Attendance information could not be loaded.'),
      });
  }

  protected applyFilters(): void {
    const filters = this.filterForm.getRawValue();
    this.loadRecords(filters.date, filters.employeeId || undefined, filters.status);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ date: '', employeeId: 0, status: '' });
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
    const status = record.status.replace(' ', '') as AttendanceStatus;
    this.editingId.set(record.id);
    this.attendanceForm.setValue({ employeeId: record.employeeId, date: record.date, status });
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.attendanceForm.reset({ employeeId: 0, date: this.today(), status: 'Present' });
  }

  protected statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
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
