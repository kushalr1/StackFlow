import { Injectable, signal } from '@angular/core';
import { ChatList } from '../models/chat';

/** Holds the list open in the full-screen viewer. One viewer is mounted in the app shell for both panels. */
@Injectable({ providedIn: 'root' })
export class ListViewerService {
  readonly current = signal<ChatList | null>(null);

  open(list: ChatList): void {
    this.current.set(list);
  }

  close(): void {
    this.current.set(null);
  }
}
