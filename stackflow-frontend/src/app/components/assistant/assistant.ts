import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { UserRole } from '../../models/auth';

export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function suggestionsFor(role: UserRole | null): string[] {
  return role === 'Admin'
    ? ['Pending leave requests', 'Department headcount', 'Delayed projects', "Today's attendance"]
    : ['My leave balance', 'My current projects', "Today's attendance", 'My tasks'];
}

export function displayNameFrom(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const words = localPart.split(/[._-]+/).filter(Boolean);
  return words.length
    ? words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
    : 'there';
}

@Component({
  selector: 'app-assistant',
  imports: [FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css',
})
export class Assistant implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);

  protected readonly greeting = computed(() => greetingFor(new Date().getHours()));
  protected readonly displayName = computed(() => displayNameFrom(this.auth.email()));
  protected readonly suggestions = computed(() => suggestionsFor(this.auth.role()));

  protected draft = '';

  ngOnInit(): void {
    this.chat.loadHistory();
  }

  protected send(): void {
    if (!this.draft.trim() || this.chat.busy()) {
      return;
    }
    this.chat.send(this.draft);
    this.draft = '';
  }

  protected ask(suggestion: string): void {
    this.chat.send(suggestion);
  }
}
