import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { EmployeeNotification, EmployeeNotificationService } from './services/employee-notification.service';
import { signal } from '@angular/core';
import { catchError, EMPTY, exhaustMap, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly dashboardService = inject(DashboardService);
  protected readonly notifications = inject(EmployeeNotificationService);
  protected readonly notificationsOpen = signal(false);
  private readonly router = inject(Router);

  constructor() {
    effect(onCleanup => {
      if (!this.authService.isAuthenticated() || this.authService.role() !== 'Employee') {
        this.notifications.inbox.set(null);
        this.notifications.error.set('');
        this.notificationsOpen.set(false);
        return;
      }
      const subscription = timer(0, 30_000).pipe(exhaustMap(() => this.notifications.refresh().pipe(
        catchError(() => { this.notifications.error.set('Notifications could not be refreshed.'); return EMPTY; }),
      ))).subscribe();
      onCleanup(() => subscription.unsubscribe());
    });
    effect(onCleanup => {
      if (!this.authService.isAuthenticated() || this.authService.role() !== 'Admin') {
        this.dashboardService.pendingLeaves.set(null);
        this.dashboardService.stats.set(null);
        return;
      }
      const subscription = timer(0, 30_000).pipe(
        exhaustMap(() => this.dashboardService.getStats().pipe(catchError(() => {
          this.dashboardService.pendingLeaves.set(null);
          return EMPTY;
        }))),
      ).subscribe();
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected openNotification(item: EmployeeNotification): void {
    this.notifications.markRead(item.id).pipe(switchMap(() => this.notifications.refresh())).subscribe({
      next: () => { this.notificationsOpen.set(false); void this.router.navigate(['/employee/projects']); },
      error: () => this.notifications.error.set('Could not open notification. Please try again.'),
    });
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
