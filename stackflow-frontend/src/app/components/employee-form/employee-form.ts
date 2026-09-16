import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EmployeeRequest } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-employee-form',
  styleUrl: './employee-form.css',
  templateUrl: './employee-form.html',
})
export class EmployeeForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  protected readonly employeeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    department: ['', [Validators.required, Validators.maxLength(100)]],
    jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
    salary: [0, [Validators.required, Validators.min(0.01)]],
    dateOfJoining: ['', Validators.required],
    isActive: [true],
  });

  protected submit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee: EmployeeRequest = this.employeeForm.getRawValue();

    this.isSubmitting.set(true);
    this.employeeService
      .createEmployee(employee)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Employee created successfully.');
          window.setTimeout(() => this.router.navigate(['/employees']), 800);
        },
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 400
                ? 'Some employee information is invalid. Review the form and try again.'
                : 'The employee could not be created. Please try again.';

          this.errorMessage.set(message);
        },
      });
  }
}
