import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Employee, EmployeeRequest } from '../../models/employee';
import { Department } from '../../models/department';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';

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

interface PhoneCountry {
  name: string;
  code: string;
  flag: string;
  digits: number;
}

const phoneCountries: PhoneCountry[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', digits: 10 },
  { name: 'United States / Canada', code: '+1', flag: '🇺🇸', digits: 10 },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', digits: 10 },
  { name: 'Australia', code: '+61', flag: '🇦🇺', digits: 9 },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', digits: 9 },
];

function countryPhone(control: AbstractControl): ValidationErrors | null {
  const countryCode = control.get('countryCode')?.value as string;
  const phone = control.get('phone')?.value as string;
  const country = phoneCountries.find(option => option.code === countryCode);

  if (!country || !phone) return null;
  return new RegExp(`^\\d{${country.digits}}$`).test(phone) ? null : { countryPhone: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePickerDirective],
  selector: 'app-employee-form',
  styleUrl: './employee-form.css',
  templateUrl: './employee-form.html',
})
export class EmployeeForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private employeeId: number | null = null;

  protected readonly isEditMode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly validationMessages = signal<string[]>([]);
  protected readonly departments = signal<Department[]>([]);
  protected readonly departmentError = signal('');
  protected readonly countryDropdownOpen = signal(false);
  protected readonly departmentDropdownOpen = signal(false);
  protected readonly loadedEmployee = signal<Employee | null>(null);
  protected readonly isRelieving = signal(false);
  protected readonly reliefError = signal('');
  protected readonly todayDate = this.today();
  protected readonly phoneCountries = phoneCountries;
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
    countryCode: ['+91', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    departmentId: [0, Validators.min(1)],
    jobTitle: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    salary: [
      0,
      [Validators.required, Validators.min(0.01), Validators.max(9999999999.99)],
    ],
    dateOfJoining: ['', Validators.required],
  }, { validators: countryPhone });

  protected readonly reliefForm = this.formBuilder.nonNullable.group({
    relievedDate: [this.todayDate, Validators.required],
    reason: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.loadDepartments();
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
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: `${formValue.countryCode}${formValue.phone}`,
      departmentId: formValue.departmentId,
      jobTitle: formValue.jobTitle.trim(),
      salary: formValue.salary,
      dateOfJoining: formValue.dateOfJoining,
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

  protected toggleCountryDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.departmentDropdownOpen.set(false);
    this.countryDropdownOpen.update(open => !open);
  }

  protected selectCountry(code: string, event: MouseEvent): void {
    event.stopPropagation();
    this.employeeForm.controls.countryCode.setValue(code);
    this.employeeForm.controls.countryCode.markAsTouched();
    this.employeeForm.controls.countryCode.markAsDirty();
    this.employeeForm.updateValueAndValidity();
    this.countryDropdownOpen.set(false);
  }

  protected toggleDepartmentDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.countryDropdownOpen.set(false);
    this.departmentDropdownOpen.update(open => !open);
  }

  protected selectDepartment(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.employeeForm.controls.departmentId.setValue(id);
    this.employeeForm.controls.departmentId.markAsTouched();
    this.employeeForm.controls.departmentId.markAsDirty();
    this.departmentDropdownOpen.set(false);
  }

  protected selectedDepartment(): Department | undefined {
    return this.departments().find(department => department.id === this.employeeForm.controls.departmentId.value);
  }

  @HostListener('document:click')
  protected closeDropdowns(): void {
    this.countryDropdownOpen.set(false);
    this.departmentDropdownOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeDropdownsWithEscape(): void {
    this.closeDropdowns();
  }

  protected relieveEmployee(): void {
    const employee = this.loadedEmployee();
    if (!employee || !employee.isActive || this.employeeId === null || this.reliefForm.invalid) {
      this.reliefForm.markAllAsTouched();
      return;
    }

    const confirmed = window.confirm(
      `Relieve ${employee.name}? Their history will be preserved, but they will be removed from new attendance, leave, and project assignment lists.`,
    );
    if (!confirmed) return;

    const value = this.reliefForm.getRawValue();
    this.reliefError.set('');
    this.isRelieving.set(true);
    this.employeeService
      .relieveEmployee(this.employeeId, {
        relievedDate: value.relievedDate,
        reason: value.reason.trim() || null,
      })
      .pipe(finalize(() => this.isRelieving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (error: HttpErrorResponse) =>
          this.reliefError.set(error.error?.message ?? 'The employee could not be relieved.'),
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
          const parsedPhone = this.parsePhone(employee.phone);
          this.loadedEmployee.set(employee);
          this.employeeForm.patchValue({
            name: employee.name,
            email: employee.email,
            countryCode: parsedPhone.countryCode,
            phone: parsedPhone.phone,
            departmentId: employee.departmentId,
            jobTitle: employee.jobTitle,
            salary: employee.salary,
            dateOfJoining: employee.dateOfJoining,
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

  private loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => this.departments.set(departments),
      error: () =>
        this.departmentError.set(
          'Departments could not be loaded. Add or refresh departments before saving.',
        ),
    });
  }

  protected selectedPhoneCountry(): PhoneCountry | undefined {
    return this.phoneCountries.find(country => country.code === this.employeeForm.controls.countryCode.value);
  }

  private parsePhone(phone: string): { countryCode: string; phone: string } {
    const normalized = phone.replace(/[\s()-]/g, '');
    const country = [...this.phoneCountries]
      .sort((first, second) => second.code.length - first.code.length)
      .find(option => normalized.startsWith(option.code));

    if (country) return { countryCode: country.code, phone: normalized.slice(country.code.length) };
    return { countryCode: '+91', phone: normalized.replace(/^\+/, '') };
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

  private today(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }
}
