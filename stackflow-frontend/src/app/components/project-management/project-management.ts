import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { Employee } from '../../models/employee';
import { Project, ProjectPriority, ProjectStatus } from '../../models/project';
import { EmployeeService } from '../../services/employee.service';
import { ProjectService } from '../../services/project.service';
import { DatePickerDirective } from '../../directives/date-picker.directive';
import { Dropdown, DropdownOption } from '../shared/dropdown/dropdown';

const projectDates: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('startDate')?.value as string;
  const due = control.get('dueDate')?.value as string;
  const completed = control.get('completedOn')?.value as string;
  const status = control.get('status')?.value as ProjectStatus;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (start && due && due < start) return { invalidDateRange: true };
  if ((status === 'Active' || status === 'OnHold') && start && start > today) return { futureActiveProject: true };
  if (status === 'Completed' && !completed) return { completedWithoutDate: true };
  if (completed && completed > today) return { futureCompletedProject: true };
  if (start && completed && completed < start) return { completionBeforeStart: true };
  if (status !== 'Completed' && completed) return { completionForOpenProject: true };
  return null;
};

@Component({
  selector: 'app-project-management', imports: [ReactiveFormsModule, DatePickerDirective, Dropdown],
  templateUrl: './project-management.html', styleUrl: './project-management.css',
})
export class ProjectManagement implements OnInit {
  @ViewChild('projectFormElement') private projectFormElement?: ElementRef<HTMLFormElement>;
  @ViewChild('projectNameInput') private projectNameInput?: ElementRef<HTMLInputElement>;
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  protected readonly statuses: { value: ProjectStatus; label: string }[] = [
    { value: 'Planned', label: 'Planned' }, { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' }, { value: 'OnHold', label: 'On Hold' },
  ];
  protected readonly priorities: ProjectPriority[] = ['High', 'Medium', 'Low'];
  protected readonly statusOptions: DropdownOption[] = this.statuses;
  protected readonly priorityOptions: DropdownOption[] = this.priorities.map(priority => ({ value: priority, label: priority }));
  protected readonly projects = signal<Project[]>([]);
  protected readonly currentProjects = computed(() => this.projects().filter(project => project.status !== 'Completed'));
  protected readonly completedProjects = computed(() => this.projects().filter(project => project.status === 'Completed'));
  protected readonly activeTab = signal<'current' | 'history' | 'form'>('current');
  protected readonly statusFilter = signal<ProjectStatus | ''>('');
  protected readonly visibleProjects = computed(() => {
    const projects = this.activeTab() === 'history' ? this.completedProjects() : this.currentProjects();
    return this.statusFilter() ? projects.filter(project => project.status === this.statusFilter()) : projects;
  });
  protected readonly expandedProjectId = signal<number | null>(null);
  protected readonly selectedProject = computed(() => {
    const selectedId = this.expandedProjectId();
    return this.visibleProjects().find(project => project.id === selectedId) ?? null;
  });
  protected readonly employees = signal<Employee[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly projectForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)], startDate: ['', Validators.required], dueDate: [''], completedOn: [''],
    status: ['Planned' as ProjectStatus, Validators.required],
    priority: ['Medium' as ProjectPriority, Validators.required],
  }, { validators: projectDates });
  protected readonly assignments = new Map<number, number>();
  protected readonly assignmentRoles = new Map<number, string>();

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const status = query.get('status');
    if (status === 'Planned' || status === 'Active' || status === 'OnHold') this.statusFilter.set(status);
    if (query.get('tab') === 'history') this.activeTab.set('history');
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
    const request = {
      ...raw,
      name: raw.name.trim(),
      description: raw.description.trim(),
      dueDate: raw.dueDate || null,
      completedOn: raw.status === 'Completed' ? raw.completedOn || null : null,
    };
    const id = this.editingId();
    const operation: Observable<Project | void> = id === null
      ? this.projectService.createProject(request) : this.projectService.updateProject(id, request);
    operation.subscribe({ next: () => {
      this.successMessage.set(id === null ? 'Project created.' : 'Project updated.');
      this.editingId.set(null);
      this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
      this.activeTab.set(raw.status === 'Completed' ? 'history' : 'current');
      this.load();
    },
      error: (error: HttpErrorResponse) => this.showError(error, 'Project could not be saved.') });
  }
  protected edit(project: Project): void {
    this.editingId.set(project.id); this.clearMessages();
    this.activeTab.set('form');
    this.projectForm.setValue({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      dueDate: project.dueDate ?? '',
      completedOn: project.completedOn ?? '',
      status: project.status.replace(' ', '') as ProjectStatus,
      priority: project.priority,
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.projectFormElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.projectNameInput?.nativeElement.focus({ preventScroll: true });
    }));
  }
  protected openCreate(): void {
    this.editingId.set(null);
    this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
    this.activeTab.set('form');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.projectNameInput?.nativeElement.focus();
    }));
  }
  protected cancelEdit(): void {
    this.editingId.set(null);
    this.projectForm.reset({ name: '', description: '', startDate: '', dueDate: '', completedOn: '', status: 'Planned', priority: 'Medium' });
    this.activeTab.set('current');
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
    const role = (this.assignmentRoles.get(project.id) ?? 'Member').trim();
    if (!role) { this.errorMessage.set('Enter the employee project role.'); return; }
    this.busyId.set(project.id);
    this.projectService.assignEmployee(project.id, {
      employeeId,
      role,
    }).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: () => {
        this.successMessage.set('Employee assigned.');
        this.assignments.delete(project.id);
        this.assignmentRoles.delete(project.id);
        this.load();
      },
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
  protected changeAssignment(projectId: number, value: string | number): void {
    this.assignments.set(projectId, Number(value));
  }
  protected changeAssignmentRole(projectId: number, event: Event): void {
    this.assignmentRoles.set(projectId, (event.target as HTMLInputElement).value);
  }
  protected availableEmployees(project: Project): Employee[] {
    const assignedIds = new Set(project.employees.map(employee => employee.id));
    return this.employees().filter(employee => !assignedIds.has(employee.id));
  }
  protected assignmentOptions(project: Project): DropdownOption[] {
    return [
      { value: 0, label: 'Select employee' },
      ...this.availableEmployees(project).map(employee => ({ value: employee.id, label: employee.name })),
    ];
  }
  protected canManageTeam(project: Project): boolean {
    return project.status === 'Planned' || project.status === 'Active';
  }
  protected showTab(tab: 'current' | 'history' | 'form'): void {
    this.expandedProjectId.set(null);
    this.statusFilter.set('');
    this.activeTab.set(tab);
  }
  protected clearStatusFilter(): void {
    this.statusFilter.set('');
  }
  protected toggleDetails(projectId: number): void {
    this.expandedProjectId.update(current => current === projectId ? null : projectId);
  }
  protected closeDetails(): void {
    this.expandedProjectId.set(null);
  }
  @HostListener('document:keydown.escape')
  protected closeDetailsWithEscape(): void {
    this.closeDetails();
  }
  protected load(): void {
    this.isLoading.set(true);
    this.projectService.getProjects().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: projects => this.projects.set(projects), error: () => this.errorMessage.set('Projects could not be loaded.'),
    });
  }
  private clearMessages(): void { this.errorMessage.set(''); this.successMessage.set(''); }
  private showError(error: HttpErrorResponse, fallback: string): void { this.errorMessage.set(error.error?.message ?? fallback); }
}
