import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attendance, AttendanceRequest } from '../models/attendance';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5090/api/attendance';

  getAttendance(date?: string, employeeId?: number, status?: string): Observable<Attendance[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (employeeId) params = params.set('employeeId', employeeId);
    if (status) params = params.set('status', status);
    return this.http.get<Attendance[]>(this.apiUrl, { params });
  }

  createAttendance(request: AttendanceRequest): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, request);
  }

  updateAttendance(id: number, request: AttendanceRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }
}
