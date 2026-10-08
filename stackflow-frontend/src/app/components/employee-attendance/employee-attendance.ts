import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EmployeeAttendance as EmployeeAttendanceModel } from '../../models/employee-attendance';
import { EmployeeAttendanceService } from '../../services/employee-attendance.service';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

@Component({
  imports: [DatePipe, ReactiveFormsModule, Dropdown],
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css',
})
export class EmployeeAttendance implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly attendanceService = inject(EmployeeAttendanceService);

  protected readonly records = signal<EmployeeAttendanceModel[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly statusOptions: DropdownOption[] = [
    { value: '', label: 'All statuses' },
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Late', label: 'Late' },
    { value: 'Half Day', label: 'Half Day' },
    { value: 'On Leave', label: 'On Leave' },
  ];
  protected readonly filterForm = this.formBuilder.nonNullable.group({
    month: [this.currentMonth()],
    status: [''],
  });
  protected readonly filteredRecords = computed(() => {
    const status = this.filterForm.controls.status.value;
    return status
      ? this.records().filter(record => record.status === status)
      : this.records();
  });
  protected readonly summary = computed(() => ({
    total: this.records().length,
    present: this.records().filter(record => record.status === 'Present').length,
    absent: this.records().filter(record => record.status === 'Absent').length,
    late: this.records().filter(record => record.status === 'Late').length,
    halfDay: this.records().filter(record => record.status === 'Half Day').length,
    leave: this.records().filter(record => record.status === 'On Leave').length,
  }));

  ngOnInit(): void {
    this.loadMonth();
  }

  protected applyFilters(): void {
    this.loadMonth();
  }

  protected clearFilters(): void {
    this.filterForm.setValue({ month: this.currentMonth(), status: '' });
    this.loadMonth();
  }

  protected statusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  private loadMonth(): void {
    const [year, month] = this.filterForm.controls.month.value.split('-').map(Number);
    if (!year || !month) {
      this.errorMessage.set('Select a valid month.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.attendanceService
      .getMonthly(year, month)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: records => this.records.set(records),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.status === 0
              ? 'The API is unavailable. Confirm that the backend is running.'
              : 'Your attendance history could not be loaded.',
          );
        },
      });
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
