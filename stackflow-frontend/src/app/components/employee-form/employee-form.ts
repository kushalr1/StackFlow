import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { EmployeeRequest } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  return typeof value === 'string' && value.trim().length === 0
    ? { blank: true }
    : null;
}

function employeeName(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value.trim())
    ? null
    : { employeeName: true };
}

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
  protected readonly validationMessages = signal<string[]>([]);
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Employee' : 'Add Employee',
  );

  protected readonly employeeForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        notBlank,
        employeeName,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    department: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    jobTitle: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    salary: [
      0,
      [Validators.required, Validators.min(0.01), Validators.max(9999999999.99)],
    ],
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
    this.validationMessages.set([]);

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formValue = this.employeeForm.getRawValue();
    const employee: EmployeeRequest = {
      ...formValue,
      name: formValue.name.trim(),
    };

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
          const validationMessages = this.getValidationMessages(error);
          const message =
            error.status === 0
              ? 'The API is unavailable. Confirm that the .NET backend is running.'
              : error.status === 400
                ? 'Some employee information is invalid. Review the form and try again.'
                : error.status === 404 && this.isEditMode()
                  ? 'This employee no longer exists. Return to the employee list.'
                : `The employee could not be ${this.isEditMode() ? 'updated' : 'created'}. Please try again.`;

          this.errorMessage.set(message);
          this.validationMessages.set(validationMessages);
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

  private getValidationMessages(error: HttpErrorResponse): string[] {
    if (error.status !== 400) {
      return [];
    }

    const errors = error.error?.errors;

    if (!errors || typeof errors !== 'object') {
      return [];
    }

    return Object.values(errors).flatMap((messages) =>
      Array.isArray(messages)
        ? messages.filter((message): message is string => typeof message === 'string')
        : [],
    );
  }
}
