import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { EmployeeProject, EmployeeProjectService } from '../../services/employee-project.service';

@Component({
  selector: 'app-employee-projects',
  imports: [DatePipe],
  templateUrl: './employee-projects.html',
  styleUrl: './employee-projects.css',
})
export class EmployeeProjects implements OnInit {
  private readonly service = inject(EmployeeProjectService);
  protected readonly projects = signal<EmployeeProject[]>([]);
  protected readonly history = signal(false);
  protected readonly selected = signal<EmployeeProject | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly displayed = computed(() => this.projects().filter(project =>
    this.history() === (project.status === 'Completed' || project.removedOn !== null)));

  ngOnInit(): void {
    this.service.getProjects().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: projects => this.projects.set(projects),
      error: () => this.error.set('Your projects could not be loaded. Please try refreshing the page.'),
    });
  }

  protected delayed(project: EmployeeProject): boolean {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return project.status !== 'Completed' && project.dueDate !== null && project.dueDate < today;
  }
}
