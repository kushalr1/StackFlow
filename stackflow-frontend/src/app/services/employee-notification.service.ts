import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface EmployeeNotification {
  id: number; projectId: number; message: string; createdAt: string; readAt: string | null;
}
interface NotificationInbox { unreadCount: number; items: EmployeeNotification[]; }

@Injectable({ providedIn: 'root' })
export class EmployeeNotificationService {
  private readonly http = inject(HttpClient);
  readonly inbox = signal<NotificationInbox | null>(null);
  readonly error = signal('');
  refresh() {
    return this.http.get<NotificationInbox>('/api/employee/notifications').pipe(tap(inbox => {
      this.inbox.set(inbox); this.error.set('');
    }));
  }
  markRead(id: number) { return this.http.patch<void>(`/api/employee/notifications/${id}/read`, {}); }
}
