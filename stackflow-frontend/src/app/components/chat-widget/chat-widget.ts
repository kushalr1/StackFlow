import { afterRenderEffect, Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { ChatAction } from '../../models/chat';
import { UserRole } from '../../models/auth';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ListCard } from '../list-card/list-card';

export const welcomeMessage = 'Hi! I\'m the StackFlow assistant. How may I help you today?';

const adminChatRoutes = /^\/(dashboard|employees|departments|attendance|leaves|projects|employees\/\d+(\/edit)?)$/;
const employeeChatRoutes = /^\/employee\/(profile|attendance|leaves|projects|tasks)$/;

/**
 * Mirrors the server's ChatRoutes whitelist. The server already decides the URL; this stops a
 * malformed or injected route from reaching the router, and keeps each role to its own pages.
 */
export function isAllowedChatRoute(route: string, role: UserRole | null): boolean {
  if (role === 'Admin') {
    return adminChatRoutes.test(route);
  }
  if (role === 'Employee') {
    return employeeChatRoutes.test(route);
  }
  return false;
}

/** Starting chips for a fresh chat. Each one is sent as a message when clicked. */
export function startingChipsFor(role: UserRole | null): string[] {
  return role === 'Admin'
    ? ['Salary stats', 'Employee details', 'Leaves', 'Attendance', 'Projects', 'To-dos']
    : ['My salary', 'My leaves', 'My projects', "Today's work", 'My attendance'];
}

@Component({
  selector: 'app-chat-widget',
  imports: [DatePipe, MarkdownPipe, ListCard],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.css',
})
export class ChatWidget implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly chat = inject(ChatService);

  protected readonly welcome = welcomeMessage;
  /** Latest reply's follow-ups win; a fresh chat shows the starting chips. */
  protected readonly chips = computed(() => {
    if (this.chat.suggestions().length > 0) {
      return this.chat.suggestions();
    }
    return this.chat.messages().length === 0 ? startingChipsFor(this.auth.role()) : [];
  });
  protected readonly draft = signal('');
  protected readonly canSend = computed(() => this.draft().trim().length > 0 && !this.chat.busy());

  private readonly messageList = viewChild<ElementRef<HTMLElement>>('messageList');
  private readonly composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');

  constructor() {
    // Keep the newest message (or the typing indicator) in view.
    afterRenderEffect(() => {
      this.chat.messages();
      this.chat.busy();
      const list = this.messageList()?.nativeElement;
      if (list) {
        list.scrollTop = list.scrollHeight;
      }
    });

    afterRenderEffect(() => {
      if (this.chat.open()) {
        this.composer()?.nativeElement.focus();
      }
    });
  }

  ngOnInit(): void {
    this.chat.loadHistory();
  }

  protected toggle(): void {
    this.chat.setOpen(!this.chat.open());
  }

  protected minimize(): void {
    this.chat.setOpen(false);
  }

  protected send(): void {
    if (!this.canSend()) {
      return;
    }
    this.chat.send(this.draft());
    this.draft.set('');
  }

  protected ask(suggestion: string): void {
    this.chat.send(suggestion);
  }

  /** Routes within the app. The widget lives in the shell, so it stays open and keeps its conversation. */
  protected runAction(action: ChatAction): void {
    if (!isAllowedChatRoute(action.route, this.auth.role())) {
      return;
    }
    void this.router.navigateByUrl(action.route);
  }

  protected onComposerKeydown(event: KeyboardEvent): void {
    // Enter sends; Shift+Enter inserts a new line. Ignore Enter while an IME is composing text.
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.send();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.minimize();
    }
  }
}
