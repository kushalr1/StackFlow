import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';

function signIn(email: string, role: 'Admin' | 'Employee'): void {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  sessionStorage.setItem('stackflow_token', `header.${payload}.signature`);
  sessionStorage.setItem('stackflow_email', email);
  sessionStorage.setItem('stackflow_role', role);
}

describe('Chat session isolation in the shell', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => sessionStorage.clear());

  it('does not render the assistant on the login screen', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-chat-widget')).toBeNull();
  });

  it('empties the conversation in memory when the session ends', () => {
    signIn('arnav@example.test', 'Employee');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const chat = TestBed.inject(ChatService);
    chat.messages.set([{ role: 'user', content: 'my private question', createdAt: '2026-10-28T09:00:00Z' }]);

    TestBed.inject(AuthService).logout();
    fixture.detectChanges();

    expect(chat.messages()).toEqual([]);
  });

  it('shows an empty conversation to the next user, not the previous one', () => {
    signIn('arnav@example.test', 'Employee');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.match('/api/chat/messages').forEach((request) => request.flush([{ role: 'user', content: 'arnav only', createdAt: '2026-10-28T09:00:00Z' }]));
    const chat = TestBed.inject(ChatService);
    expect(chat.messages().length).toBe(1);

    TestBed.inject(AuthService).logout();
    fixture.detectChanges();
    sessionStorage.clear();
    signIn('admin@example.test', 'Admin');
    TestBed.inject(AuthService).role.set('Admin');
    chat.loadHistory();
    http.match('/api/chat/messages').forEach((request) => request.flush([]));

    expect(chat.messages()).toEqual([]);
    expect(chat.messages().some((message) => message.content === 'arnav only')).toBe(false);
  });
});
