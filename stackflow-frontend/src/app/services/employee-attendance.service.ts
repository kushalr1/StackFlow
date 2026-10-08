import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeAttendance } from '../models/employee-attendance';

@Injectable({ providedIn: 'root' })
export class EmployeeAttendanceService {
  private readonly http = inject(HttpClient);

  getMonthly(year: number, month: number): Observable<EmployeeAttendance[]> {
    const params = new HttpParams()
      .set('year', year)
      .set('month', month);

    return this.http.get<EmployeeAttendance[]>('/api/employee/attendance', { params });
  }
}
