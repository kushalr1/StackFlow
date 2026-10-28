import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatMessage, SendChatMessageResponse } from '../models/chat';

const openStateKey = 'stackflow_chat_open';

/**
 * Conversation and widget state for the floating assistant. Lives at root scope so the chat
 * survives route changes. It is reset on logout (see App) so one user's chat never shows for another.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/chat';
  private historyLoaded = false;

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  /** Follow-up or clarifying chips for the latest reply. */
  readonly suggestions = signal<string[]>([]);
  readonly open = signal(this.readOpenState());

  setOpen(isOpen: boolean): void {
    this.open.set(isOpen);
    try {
      sessionStorage.setItem(openStateKey, String(isOpen));
    } catch {
      // Storage can be blocked (private mode, disabled site data). The widget still works without it.
    }
  }

  loadHistory(): void {
    if (this.historyLoaded || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.http
      .get<ChatMessage[]>(`${this.apiUrl}/messages`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (messages) => {
          // The server stores UTC times without a zone suffix; mark them so they display in local time.
          this.messages.set(messages.map((message) => ({ ...message, createdAt: toUtcIso(message.createdAt) })));
          this.historyLoaded = true;
        },
        error: (err: HttpErrorResponse) => this.error.set(this.describeError(err)),
      });
  }

  send(message: string): void {
    const trimmed = message.trim();
    if (this.busy() || !trimmed) {
      return;
    }

    this.busy.set(true);
    this.error.set('');
    this.suggestions.set([]);
    this.messages.update((current) => [
      ...current,
      { role: 'user', content: trimmed, createdAt: new Date().toISOString() },
    ]);

    this.http
      .post<SendChatMessageResponse>(`${this.apiUrl}/messages`, { message: trimmed })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (response) => {
          this.messages.update((current) => [
            ...current,
            {
              role: 'assistant',
              content: response.reply,
              createdAt: new Date().toISOString(),
              actions: response.actions ?? [],
              lists: (response.lists ?? []).filter((list) => list.rows.length > 0),
            },
          ]);
          this.suggestions.set(response.suggestions ?? []);
        },
        error: (err: HttpErrorResponse) => this.error.set(this.describeError(err)),
      });
  }

  /**
   * Deletes the stored conversation on the server. Call before logout, while the token is still
   * attached. Failures are ignored: the next login only ever loads its own account's history.
   */
  endSession(): void {
    this.http.delete(`${this.apiUrl}/messages`).subscribe({ error: () => undefined });
  }

  /** Forgets everything held in memory for the current user. Called when the session ends. */
  reset(): void {
    this.messages.set([]);
    this.suggestions.set([]);
    this.loading.set(false);
    this.busy.set(false);
    this.error.set('');
    this.historyLoaded = false;
  }

  private readOpenState(): boolean {
    try {
      return sessionStorage.getItem(openStateKey) === 'true';
    } catch {
      return false;
    }
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The AI assistant is unavailable right now. Please try again shortly.';
    }
    return error.error?.message ?? 'Something went wrong. Please try again.';
  }
}

function toUtcIso(value: string): string {
  return /([zZ]|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
}
