import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee } from '../../models/employee';
import { Department } from '../../models/department';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-employee-list',
  styleUrl: './employee-list.css',
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly departments = signal<Department[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedDepartment = signal('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly deletingEmployeeId = signal<number | null>(null);
  protected readonly deleteErrorMessage = signal('');

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => this.departments.set(departments),
    });
    this.loadEmployees();
  }

  protected loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService
      .getEmployees(
        this.searchTerm(),
        this.selectedDepartment() ? Number(this.selectedDepartment()) : undefined,
      )
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

  protected updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  protected updateDepartment(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDepartment.set(select.value);
  }

  protected applyFilters(): void {
    this.loadEmployees();
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDepartment.set('');
    this.loadEmployees();
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
