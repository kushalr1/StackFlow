import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee, EmployeeRequest, RelieveEmployeeRequest } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/employees';

  getEmployees(search?: string, departmentId?: number, isActive?: boolean): Observable<Employee[]> {
    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive);
    }

    return this.http.get<Employee[]>(this.apiUrl, { params });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: EmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: EmployeeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, employee);
  }

  relieveEmployee(id: number, request: RelieveEmployeeRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/relieve`, request);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
