import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee } from '../../models/employee';
import { Department } from '../../models/department';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

@Component({
  imports: [DecimalPipe, RouterLink, Dropdown],
  selector: 'app-employee-list',
  styleUrl: './employee-list.css',
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly departments = signal<Department[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedDepartment = signal('');
  protected readonly employmentStatus = signal<'' | 'active' | 'relieved'>('');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly deletingEmployeeId = signal<number | null>(null);
  protected readonly deleteErrorMessage = signal('');
  protected readonly employmentOptions: DropdownOption[] = [
    { value: '', label: 'All employees' },
    { value: 'active', label: 'Active employees' },
    { value: 'relieved', label: 'Relieved employees' },
  ];

  protected departmentOptions(): DropdownOption[] {
    return [
      { value: '', label: 'All departments' },
      ...this.departments().map(department => ({ value: String(department.id), label: department.name })),
    ];
  }

  ngOnInit(): void {
    const departmentId = this.route.snapshot.queryParamMap.get('departmentId');
    const isActive = this.route.snapshot.queryParamMap.get('isActive');

    if (departmentId && Number(departmentId) > 0) {
      this.selectedDepartment.set(departmentId);
    }

    this.employmentStatus.set(isActive === 'true' ? 'active' : isActive === 'false' ? 'relieved' : '');

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
        this.employmentStatus() === 'active' ? true : this.employmentStatus() === 'relieved' ? false : undefined,
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

  protected updateDepartment(value: string | number): void {
    this.selectedDepartment.set(String(value));
  }

  protected updateEmploymentStatus(value: string | number): void {
    this.employmentStatus.set(String(value) as '' | 'active' | 'relieved');
  }

  protected applyFilters(): void {
    this.loadEmployees();
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDepartment.set('');
    this.employmentStatus.set('');
    this.loadEmployees();
  }

  protected deleteEmployee(employee: Employee): void {
    const confirmed = window.confirm(
      `Permanently delete ${employee.name}? Use this only for a mistaken employee record. This action cannot be undone.`,
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
          const message = error.status === 0
            ? 'The API is unavailable. Confirm that the .NET backend is running.'
            : error.error?.message ?? `${employee.name} could not be deleted. Please try again.`;

          this.deleteErrorMessage.set(message);
        },
      });
  }

}
