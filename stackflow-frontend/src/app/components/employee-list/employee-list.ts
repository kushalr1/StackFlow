import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-employee-list',
  styleUrl: './employee-list.css',
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly deletingEmployeeId = signal<number | null>(null);
  protected readonly deleteErrorMessage = signal('');

  ngOnInit(): void {
    this.loadEmployees();
  }

  protected loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService
      .getEmployees()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (employees) => this.employees.set(employees),
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : 'Employees could not be loaded. Please try again.';

          this.errorMessage.set(message);
        },
      });
  }

  protected deleteEmployee(employee: Employee): void {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.deleteErrorMessage.set('');
    this.deletingEmployeeId.set(employee.id);

    this.employeeService
      .deleteEmployee(employee.id)
      .pipe(finalize(() => this.deletingEmployeeId.set(null)))
      .subscribe({
        next: () => this.loadEmployees(),
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 404
                ? `${employee.name} was not found. Refresh the list and try again.`
                : `${employee.name} could not be deleted. Please try again.`;

          this.deleteErrorMessage.set(message);
        },
      });
  }
}
