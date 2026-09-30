import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, ProjectAssignmentRequest, ProjectRequest } from '../models/project';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/projects';
  getProjects(status?: string): Observable<Project[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Project[]>(this.apiUrl, { params });
  }
  createProject(request: ProjectRequest): Observable<Project> { return this.http.post<Project>(this.apiUrl, request); }
  updateProject(id: number, request: ProjectRequest): Observable<void> { return this.http.put<void>(`${this.apiUrl}/${id}`, request); }
  deleteProject(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  assignEmployee(projectId: number, request: ProjectAssignmentRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${projectId}/employees`, request);
  }
  removeEmployee(projectId: number, employeeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/employees/${employeeId}`);
  }
}
