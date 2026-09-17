import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { Department } from '../../models/department';
import { DepartmentService } from '../../services/department.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-department-management',
  styleUrl: './department-management.css',
  templateUrl: './department-management.html',
})
export class DepartmentManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);

  protected readonly departments = signal<Department[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly departmentForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/.*\S.*/),
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    description: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  protected loadDepartments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.departmentService
      .getDepartments()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (departments) => this.departments.set(departments),
        error: () =>
          this.errorMessage.set('Departments could not be loaded. Please try again.'),
      });
  }

  protected saveDepartment(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const value = this.departmentForm.getRawValue();
    const request = {
      name: value.name.trim(),
      description: value.description.trim(),
    };
    const editingId = this.editingId();
    const operation: Observable<Department | void> = editingId === null
      ? this.departmentService.createDepartment(request)
      : this.departmentService.updateDepartment(editingId, request);

    this.isSaving.set(true);
    operation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.successMessage.set(
          editingId === null
            ? 'Department created successfully.'
            : 'Department updated successfully.',
        );
        this.cancelEdit();
        this.loadDepartments();
      },
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(
          error.error?.message ?? 'The department could not be saved. Please try again.',
        ),
    });
  }

  protected editDepartment(department: Department): void {
    this.editingId.set(department.id);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.departmentForm.setValue({
      name: department.name,
      description: department.description,
    });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.departmentForm.reset({ name: '', description: '' });
  }

  protected deleteDepartment(department: Department): void {
    if (!window.confirm(`Delete ${department.name}?`)) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.deletingId.set(department.id);

    this.departmentService
      .deleteDepartment(department.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set('Department deleted successfully.');
          this.loadDepartments();
        },
        error: (error: HttpErrorResponse) =>
          this.errorMessage.set(
            error.error?.message ?? 'The department could not be deleted.',
          ),
      });
  }
}
