import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly totalEmployees = computed(() => this.employees().length);
  protected readonly activeEmployees = computed(
    () => this.employees().filter((employee) => employee.isActive).length,
  );
  protected readonly inactiveEmployees = computed(
    () => this.employees().filter((employee) => !employee.isActive).length,
  );
  protected readonly departmentCount = computed(
    () =>
      new Set(
        this.employees().map((employee) => employee.department.toLowerCase()),
      ).size,
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
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
              : 'Dashboard statistics could not be loaded. Please try again.';

          this.errorMessage.set(message);
        },
      });
  }
}
