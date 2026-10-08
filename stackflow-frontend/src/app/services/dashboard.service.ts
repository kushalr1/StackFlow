import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DashboardStats } from '../models/dashboard-stats';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  readonly pendingLeaves = signal<number | null>(null);
  readonly stats = signal<DashboardStats | null>(null);
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/dashboard/stats').pipe(tap(stats => {
      this.stats.set(stats);
      this.pendingLeaves.set(stats.pendingLeaveRequests);
    }));
  }
}
