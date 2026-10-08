import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeAccount, EmployeeAccountService } from '../../services/employee-account.service';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  imports: [DatePipe, DecimalPipe, RouterLink, ReactiveFormsModule],
  selector: 'app-employee-details',
  styleUrl: './employee-details.css',
  templateUrl: './employee-details.html',
})
export class EmployeeDetails implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly accountService = inject(EmployeeAccountService);
  protected readonly account = signal<EmployeeAccount | null>(null);
  protected readonly accountLoading = signal(true);
  protected readonly accountSaving = signal(false);
  protected readonly accountError = signal('');
  protected readonly accountSuccess = signal('');
  protected readonly passwordVisible = signal(false);
  protected readonly resetOpen = signal(false);
  protected readonly accessConfirmation = signal(false);
  protected readonly accountForm = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    confirmation: [''],
  });

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
    this.accountService.getAccount(id).pipe(finalize(() => this.accountLoading.set(false))).subscribe({
      next: account => this.account.set(account),
      error: () => this.accountError.set('Login access could not be loaded. Refresh to try again.'),
    });
  }

  protected createAccount(): void {
    const employee = this.employee();
    if (!employee || !employee.isActive || this.accountSaving() || this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    if (this.resetOpen() && this.accountForm.controls.password.value !== this.accountForm.controls.confirmation.value) {
      this.accountError.set('Passwords do not match.');
      return;
    }
    this.accountError.set('');
    this.accountSaving.set(true);
    const resetting = this.resetOpen();
    const operation = resetting
      ? this.accountService.resetPassword(employee.id, this.accountForm.controls.password.value)
      : this.accountService.createAccount(employee.id, this.accountForm.controls.password.value);
    operation
      .pipe(finalize(() => this.accountSaving.set(false))).subscribe({
        next: account => {
          this.account.set(account);
          this.accountForm.reset();
          this.passwordVisible.set(false);
          this.resetOpen.set(false);
          this.accountSuccess.set(resetting ? 'Password reset. Previous sessions are invalid. Share the new password privately.' : 'Employee login access created. Share the password privately with the employee.');
        },
        error: (error: HttpErrorResponse) => this.accountError.set(error.error?.message ?? 'Login access could not be created.'),
      });
  }

  protected toggleAccess(): void {
    const employee = this.employee();
    const account = this.account();
    if (!employee || !account || this.accountSaving()) return;
    this.accountSaving.set(true);
    this.accountError.set('');
    this.accountSuccess.set('');
    this.accountService.setAccess(employee.id, !account.isActive)
      .pipe(finalize(() => this.accountSaving.set(false))).subscribe({
        next: updated => {
          this.account.set(updated);
          this.accessConfirmation.set(false);
          this.resetOpen.set(false);
          this.accountForm.reset();
          this.passwordVisible.set(false);
          this.accountSuccess.set(updated.isActive ? 'Login enabled. Employee can sign in with existing credentials.' : 'Login disabled. Existing sessions are invalid. Employee history is preserved.');
        },
        error: (error: HttpErrorResponse) => this.accountError.set(error.error?.message ?? 'Login access could not be updated.'),
      });
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
