import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/dashboard-stats';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('http://localhost:5090/api/dashboard/stats');
  }
}
