import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ChatMessage, SendChatMessageResponse } from '../models/chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/chat';

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');

  loadHistory(): void {
    this.loading.set(true);
    this.error.set('');
    this.http
      .get<ChatMessage[]>(`${this.apiUrl}/messages`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (messages) => this.messages.set(messages),
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
    this.messages.update((current) => [
      ...current,
      { role: 'user', content: trimmed, createdAt: new Date().toISOString() },
    ]);

    this.http
      .post<SendChatMessageResponse>(`${this.apiUrl}/messages`, { message: trimmed })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (response) =>
          this.messages.update((current) => [
            ...current,
            { role: 'assistant', content: response.reply, createdAt: new Date().toISOString() },
          ]),
        error: (err: HttpErrorResponse) => this.error.set(this.describeError(err)),
      });
  }

  private describeError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The AI assistant is unavailable right now. Please try again shortly.';
    }
    return error.error?.message ?? 'Something went wrong. Please try again.';
  }
}
