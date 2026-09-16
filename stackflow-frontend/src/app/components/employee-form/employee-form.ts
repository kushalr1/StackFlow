import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { EmployeeRequest } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-employee-form',
  styleUrl: './employee-form.css',
  templateUrl: './employee-form.html',
})
export class EmployeeForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private employeeId: number | null = null;

  protected readonly isEditMode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Employee' : 'Add Employee',
  );

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

  ngOnInit(): void {
    const idParameter = this.route.snapshot.paramMap.get('id');

    if (idParameter === null) {
      return;
    }

    this.isEditMode.set(true);
    const id = Number(idParameter);

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('The employee ID is invalid.');
      this.employeeForm.disable();
      return;
    }

    this.employeeId = id;
    this.loadEmployee(id);
  }

  protected submit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employee: EmployeeRequest = this.employeeForm.getRawValue();

    this.isSubmitting.set(true);
    const request: Observable<unknown> =
      this.isEditMode() && this.employeeId !== null
        ? this.employeeService.updateEmployee(this.employeeId, employee)
        : this.employeeService.createEmployee(employee);

    request
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          const action = this.isEditMode() ? 'updated' : 'created';
          this.successMessage.set(`Employee ${action} successfully.`);
          window.setTimeout(() => this.router.navigate(['/employees']), 800);
        },
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 400
                ? 'Some employee information is invalid. Review the form and try again.'
                : `The employee could not be ${this.isEditMode() ? 'updated' : 'created'}. Please try again.`;

          this.errorMessage.set(message);
        },
      });
  }

  private loadEmployee(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService
      .getEmployee(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (employee) => {
          this.employeeForm.patchValue({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            jobTitle: employee.jobTitle,
            salary: employee.salary,
            dateOfJoining: employee.dateOfJoining,
            isActive: employee.isActive,
          });
        },
        error: (error: HttpErrorResponse) => {
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 404
                ? `Employee with ID ${id} was not found.`
                : 'The employee could not be loaded. Please try again.';

          this.errorMessage.set(message);
          this.employeeForm.disable();
        },
      });
  }
}
