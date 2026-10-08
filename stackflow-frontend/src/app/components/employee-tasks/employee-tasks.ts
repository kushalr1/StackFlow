import { DatePipe } from '@angular/common';
import { InitialCapitalDirective } from '../../directives/initial-capital.directive';
import { HttpClient } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, timer } from 'rxjs';

interface PersonalTask { id: number; title: string; period: string; dueDate: string; isCompleted: boolean; }
export function localDate(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
export function taskAlert(task: PersonalTask, today: string): string {
  const tomorrow = new Date(`${today}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return task.isCompleted ? '' : task.dueDate < today ? 'Overdue' : task.dueDate === today ? 'Due today'
    : task.dueDate === tomorrow.toISOString().slice(0, 10) ? 'Due tomorrow' : '';
}
@Component({ selector: 'app-employee-tasks', imports: [FormsModule, DatePipe, InitialCapitalDirective], templateUrl: './employee-tasks.html', styleUrl: './employee-tasks.css' })
export class EmployeeTasks implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroy = inject(DestroyRef);
  protected readonly tasks = signal<PersonalTask[]>([]);
  protected readonly today = signal(localDate());
  protected readonly busy = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly history = signal(false);
  protected readonly visible = computed(() => this.tasks().filter(t => t.isCompleted === this.history()));
  protected readonly alerts = computed(() => this.tasks().filter(t => taskAlert(t, this.today())).length);
  protected title = '';
  protected weekly = false;
  protected dueDate = localDate();
  ngOnInit(): void {
    this.load();
    timer(60000, 60000).pipe(takeUntilDestroyed(this.destroy)).subscribe(() => this.today.set(localDate()));
  }
  protected alert(task: PersonalTask): string { return taskAlert(task, this.today()); }
  private load(): void {
    this.http.get<PersonalTask[]>('/api/employee/tasks').pipe(takeUntilDestroyed(this.destroy), finalize(() => this.loading.set(false))).subscribe({
      next: tasks => this.tasks.set(tasks), error: () => this.error.set('Tasks could not be loaded. Refresh and try again.'),
    });
  }
  protected add(): void {
    if (this.busy()) return;
    if (!this.title.trim() || this.title.trim().length > 150 || !/^\d{4}-\d{2}-\d{2}$/.test(this.dueDate) || this.dueDate < this.today() || this.dueDate > '2100-12-31') {
      this.error.set('Enter a title and valid deadline today or later.'); return;
    }
    this.write(this.http.post('/api/employee/tasks', { title: this.title.trim(), period: this.weekly ? 'Weekly' : 'Daily', dueDate: this.dueDate }), () => { this.title = ''; });
  }
  protected complete(task: PersonalTask): void {
    this.write(this.http.patch(`/api/employee/tasks/${task.id}/completion`, { isCompleted: !task.isCompleted }));
  }
  protected remove(task: PersonalTask): void {
    if (window.confirm(`Delete personal task "${task.title}"?`)) this.write(this.http.delete(`/api/employee/tasks/${task.id}`));
  }
  private write(request: import('rxjs').Observable<unknown>, done = () => {}): void {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    request.pipe(takeUntilDestroyed(this.destroy), finalize(() => this.busy.set(false))).subscribe({
      next: () => { done(); this.load(); }, error: () => this.error.set('Task could not be saved. Check your connection and try again.'),
    });
  }
}
