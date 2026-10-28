import { Component, effect, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { ChatService } from './services/chat.service';
import { ChatWidget } from './components/chat-widget/chat-widget';
import { ListViewer } from './components/list-viewer/list-viewer';
import { ListViewerService } from './services/list-viewer.service';
import { EmployeeNotification, EmployeeNotificationService } from './services/employee-notification.service';
import { signal } from '@angular/core';
import { catchError, EMPTY, exhaustMap, switchMap, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ChatWidget, ListViewer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly dashboardService = inject(DashboardService);
  protected readonly notifications = inject(EmployeeNotificationService);
  private readonly chat = inject(ChatService);
  private readonly listViewer = inject(ListViewerService);
  protected readonly notificationsOpen = signal(false);
  private readonly notificationAnchor = viewChild<ElementRef<HTMLElement>>('notificationAnchor');
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      // Chat history belongs to the signed-in account; drop it as soon as the session ends.
      if (!this.authService.isAuthenticated()) {
        this.chat.reset();
        this.listViewer.close();
      }
    });
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

  @HostListener('document:click', ['$event.target'])
  protected closeNotificationsOnOutsideClick(target: EventTarget | null): void {
    const anchor = this.notificationAnchor()?.nativeElement;
    if (this.notificationsOpen() && anchor && target instanceof Node && !anchor.contains(target)) {
      this.notificationsOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeNotificationsOnEscape(): void {
    this.notificationsOpen.set(false);
  }

  protected logout(): void {
    this.chat.endSession();
    this.authService.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
