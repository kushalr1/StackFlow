import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface EmployeeProject {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  role: string;
  startDate: string;
  dueDate: string | null;
  completedOn: string | null;
  assignedOn: string | null;
  removedOn: string | null;
}

@Injectable({ providedIn: 'root' })
export class EmployeeProjectService {
  private readonly http = inject(HttpClient);

  getProjects() {
    return this.http.get<EmployeeProject[]>('/api/employee/projects');
  }
}
