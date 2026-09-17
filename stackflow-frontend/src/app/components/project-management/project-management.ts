import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Employee } from '../../models/employee';
import { Project, ProjectStatus } from '../../models/project';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';

const projectDates: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startDate')?.value as string;
  const end = control.get('endDate')?.value as string;
  return start && end && end < start ? { invalidDateRange: true } : null;
};

@Component({
  selector: 'app-project-management', imports: [ReactiveFormsModule],
  templateUrl: './project-management.html', styleUrl: './project-management.css',
})
export class ProjectManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly employeeService = inject(EmployeeService);
  protected readonly statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'Planned', label: 'Planned' }, { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' }, { value: 'OnHold', label: 'On Hold' },
  ];
  protected readonly projects = signal<Project[]>([]);
  protected readonly employees = signal<Employee[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly projectForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)], startDate: ['', Validators.required], endDate: [''],
    status: ['Planned' as ProjectStatus, Validators.required],
  }, { validators: projectDates });
  protected readonly statusFilter = this.fb.nonNullable.control('');
  protected readonly assignments = new Map<number, number>();

  ngOnInit(): void {
    forkJoin({ projects: this.projectService.getProjects(), employees: this.employeeService.getEmployees() })
      .pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: value => { this.projects.set(value.projects); this.employees.set(value.employees.filter(e => e.isActive)); },
        error: () => this.errorMessage.set('Project information could not be loaded.'),
      });
  }
  protected saveProject(): void {
    this.clearMessages();
    if (this.projectForm.invalid) { this.projectForm.markAllAsTouched(); return; }
    const raw = this.projectForm.getRawValue();
    const request = { ...raw, name: raw.name.trim(), description: raw.description.trim(), endDate: raw.endDate || null };
    const id = this.editingId();
    const operation: Observable<Project | void> = id === null
      ? this.projectService.createProject(request) : this.projectService.updateProject(id, request);
    operation.subscribe({ next: () => { this.successMessage.set(id === null ? 'Project created.' : 'Project updated.'); this.cancelEdit(); this.load(); },
      error: (error: HttpErrorResponse) => this.showError(error, 'Project could not be saved.') });
  }
  protected edit(project: Project): void {
    this.editingId.set(project.id); this.clearMessages();
    this.projectForm.setValue({ name: project.name, description: project.description, startDate: project.startDate,
      endDate: project.endDate ?? '', status: project.status.replace(' ', '') as ProjectStatus });
  }
  protected cancelEdit(): void {
    this.editingId.set(null);
    this.projectForm.reset({ name: '', description: '', startDate: '', endDate: '', status: 'Planned' });
  }
  protected removeProject(project: Project): void {
    if (!window.confirm(`Delete ${project.name}?`)) return;
    this.busyId.set(project.id);
    this.projectService.deleteProject(project.id).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: () => { this.successMessage.set('Project deleted.'); this.load(); },
      error: error => this.showError(error, 'Project could not be deleted.'),
    });
  }
  protected assign(project: Project): void {
    const employeeId = this.assignments.get(project.id) ?? 0;
    if (!employeeId) { this.errorMessage.set('Select an employee to assign.'); return; }
    this.busyId.set(project.id);
    this.projectService.assignEmployee(project.id, employeeId).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: () => { this.successMessage.set('Employee assigned.'); this.assignments.delete(project.id); this.load(); },
      error: error => this.showError(error, 'Employee could not be assigned.'),
    });
  }
  protected unassign(projectId: number, employeeId: number): void {
    this.busyId.set(projectId);
    this.projectService.removeEmployee(projectId, employeeId).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: () => { this.successMessage.set('Employee removed from project.'); this.load(); },
      error: error => this.showError(error, 'Employee could not be removed.'),
    });
  }
  protected changeAssignment(projectId: number, event: Event): void {
    this.assignments.set(projectId, Number((event.target as HTMLSelectElement).value));
  }
  protected load(): void {
    this.isLoading.set(true);
    this.projectService.getProjects(this.statusFilter.value).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: projects => this.projects.set(projects), error: () => this.errorMessage.set('Projects could not be loaded.'),
    });
  }
  private clearMessages(): void { this.errorMessage.set(''); this.successMessage.set(''); }
  private showError(error: HttpErrorResponse, fallback: string): void { this.errorMessage.set(error.error?.message ?? fallback); }
}
