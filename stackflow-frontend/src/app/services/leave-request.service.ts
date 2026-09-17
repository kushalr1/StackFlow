import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LeaveRequest, LeaveStatus, LeaveType, SaveLeaveRequest } from '../models/leave-request';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5090/api/leaves';

  getLeaveRequests(employeeId?: number, status?: string, leaveType?: string): Observable<LeaveRequest[]> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employeeId', employeeId);
    if (status) params = params.set('status', status);
    if (leaveType) params = params.set('leaveType', leaveType);
    return this.http.get<LeaveRequest[]>(this.apiUrl, { params });
  }

  createLeaveRequest(request: SaveLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, request);
  }

  updateLeaveRequest(id: number, request: SaveLeaveRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, status: Exclude<LeaveStatus, 'Pending'>): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }
}
