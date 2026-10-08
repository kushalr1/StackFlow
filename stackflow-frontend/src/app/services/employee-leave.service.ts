import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateEmployeeLeave, EmployeeLeave } from '../models/employee-leave';

@Injectable({ providedIn: 'root' })
export class EmployeeLeaveService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/employee/leaves';

  getLeaves(): Observable<EmployeeLeave[]> {
    return this.http.get<EmployeeLeave[]>(this.apiUrl);
  }

  createLeave(request: CreateEmployeeLeave): Observable<EmployeeLeave> {
    return this.http.post<EmployeeLeave>(this.apiUrl, request);
  }
}
