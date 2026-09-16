import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [DatePipe, DecimalPipe, RouterLink],
  selector: 'app-employee-details',
  styleUrl: './employee-details.css',
  templateUrl: './employee-details.html',
})
export class EmployeeDetails implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const idParameter = this.route.snapshot.paramMap.get('id');
    const id = Number(idParameter);

    if (idParameter === null || !Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('The employee ID is invalid.');
      this.isLoading.set(false);
      return;
    }

    this.loadEmployee(id);
  }

  private loadEmployee(id: number): void {
    this.employeeService
      .getEmployee(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (employee) => this.employee.set(employee),
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 404
                ? `Employee with ID ${id} was not found.`
                : 'The employee could not be loaded. Please try again.';

          this.errorMessage.set(message);
        },
      });
  }
}
