import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatWidget, isAllowedChatRoute, welcomeMessage } from './chat-widget';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat';
import { vi } from 'vitest';

const reply = { reply: 'Here you go.', actions: [], suggestions: [], lists: [] };

function signIn(role: 'Admin' | 'Employee'): void {
  sessionStorage.clear();
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  sessionStorage.setItem('stackflow_token', `header.${payload}.signature`);
  sessionStorage.setItem('stackflow_role', role);
}

function mount(role: 'Admin' | 'Employee' = 'Employee') {
  signIn(role);
  TestBed.configureTestingModule({
    imports: [ChatWidget],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(ChatWidget);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.match('/api/chat/messages').forEach((request) => request.flush([]));
  fixture.detectChanges();
  return {
    fixture,
    http,
    el: fixture.nativeElement as HTMLElement,
    chat: TestBed.inject(ChatService),
    router: TestBed.inject(Router),
  };
}

function typeDraft(el: HTMLElement, value: string): void {
  const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
  textarea.value = value;
  textarea.dispatchEvent(new Event('input'));
}

function sendButton(el: HTMLElement): HTMLButtonElement {
  return el.querySelector('button.send') as HTMLButtonElement;
}

function assistantMessage(content: string, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { role: 'assistant', content, createdAt: '2026-10-28T09:00:00Z', ...extra };
}

describe('ChatWidget behaviour', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('opens from the launcher and closes with the minimize button', () => {
    const { fixture, el, chat } = mount();

    (el.querySelector('.launcher') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(chat.open()).toBe(true);

    (el.querySelector('button[aria-label="Minimize chat"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(chat.open()).toBe(false);
  });

  it('shows the welcome message and the starting chips on first open', () => {
    const { el } = mount('Employee');

    expect(el.querySelector('.bubble.assistant')?.textContent).toContain(welcomeMessage);
    const chips = Array.from(el.querySelectorAll('.chip')).map((chip) => chip.textContent?.trim());
    expect(chips).toContain('My salary');
    expect(chips).not.toContain('Salary stats');
  });

  it('keeps Send disabled for an empty or whitespace-only draft', () => {
    const { fixture, el } = mount();

    typeDraft(el, '   \n\t ');
    fixture.detectChanges();
    expect(sendButton(el).disabled).toBe(true);

    typeDraft(el, '');
    fixture.detectChanges();
    expect(sendButton(el).disabled).toBe(true);

    typeDraft(el, 'hi');
    fixture.detectChanges();
    expect(sendButton(el).disabled).toBe(false);
  });

  it('sends on Enter', () => {
    const { fixture, el, http } = mount();
    typeDraft(el, 'my salary');
    fixture.detectChanges();

    (el.querySelector('textarea') as HTMLTextAreaElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    const request = http.expectOne('/api/chat/messages');
    expect(request.request.body).toEqual({ message: 'my salary' });
    request.flush(reply);
  });

  it('inserts a new line and does not send on Shift+Enter', () => {
    const { fixture, el, http } = mount();
    typeDraft(el, 'first line');
    fixture.detectChanges();

    (el.querySelector('textarea') as HTMLTextAreaElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));

    http.expectNone('/api/chat/messages');
  });

  it('shows the typing indicator while waiting and removes it when the reply arrives', () => {
    const { fixture, el, http } = mount();
    typeDraft(el, 'hello');
    fixture.detectChanges();
    sendButton(el).click();
    fixture.detectChanges();
    expect(el.querySelector('.typing')).not.toBeNull();

    http.expectOne('/api/chat/messages').flush(reply);
    fixture.detectChanges();

    expect(el.querySelector('.typing')).toBeNull();
  });

  it('shows a friendly error and keeps the input usable after an API failure', () => {
    const { fixture, el, http } = mount();
    typeDraft(el, 'hello');
    fixture.detectChanges();
    sendButton(el).click();

    http.expectOne('/api/chat/messages').flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(el.querySelector('.error')?.textContent).toContain('Something went wrong');
    expect((el.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(false);
    typeDraft(el, 'try again');
    fixture.detectChanges();
    expect(sendButton(el).disabled).toBe(false);
  });

  it('has no Clear chat button', () => {
    const { el } = mount();

    const labels = Array.from(el.querySelectorAll('button')).map((button) => button.textContent ?? '');
    expect(labels.some((label) => /clear/i.test(label))).toBe(false);
  });

  it('keeps the conversation when the widget is destroyed and created again on another page', () => {
    const first = mount();
    first.chat.messages.set([{ role: 'user', content: 'remember this', createdAt: '2026-10-28T09:00:00Z' }]);
    first.fixture.destroy();

    const second = TestBed.createComponent(ChatWidget);
    second.detectChanges();

    expect((second.nativeElement as HTMLElement).querySelector('.bubble.user')?.textContent).toContain('remember this');
  });

  it('renders assistant Markdown without executing script, event handlers or javascript links', () => {
    const { fixture, el, chat } = mount();
    chat.messages.set([
      assistantMessage('Hi <script>window.__pwned = true</script> <img src="x" onerror="window.__pwned = true"> [bad](javascript:alert(1)) **bold**'),
    ]);
    fixture.detectChanges();

    const markdown = el.querySelector('.bubble.markdown') as HTMLElement;
    expect(markdown.querySelector('script')).toBeNull();
    expect(markdown.querySelector('img[onerror]')).toBeNull();
    expect(Array.from(markdown.querySelectorAll('a')).some((anchor) => anchor.getAttribute('href')?.startsWith('javascript:'))).toBe(false);
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    expect(markdown.textContent).not.toContain('**');
  });

  it('navigates when an action carries a route allowed for the caller', () => {
    const { fixture, el, chat, router } = mount('Admin');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    chat.messages.set([assistantMessage('Done.', { actions: [{ label: 'Open Projects', route: '/projects' }] })]);
    fixture.detectChanges();

    (el.querySelector('.action') as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledWith('/projects');
  });

  it('ignores an action whose route is not on the whitelist', () => {
    const { fixture, el, chat, router } = mount('Admin');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    chat.messages.set([assistantMessage('Done.', { actions: [{ label: 'Go', route: 'https://evil.example/steal' }] })]);
    fixture.detectChanges();

    (el.querySelector('.action') as HTMLButtonElement).click();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('never navigates an employee to an admin-only route', () => {
    const { fixture, el, chat, router } = mount('Employee');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    chat.messages.set([assistantMessage('Done.', { actions: [{ label: 'Open Employees', route: '/employees' }] })]);
    fixture.detectChanges();

    (el.querySelector('.action') as HTMLButtonElement).click();

    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('isAllowedChatRoute', () => {
  it.each(['/dashboard', '/employees', '/employees/12', '/employees/12/edit', '/leaves', '/projects'])('allows %s for an admin', (route) => {
    expect(isAllowedChatRoute(route, 'Admin')).toBe(true);
  });

  it.each(['/employee/profile', '/employee/tasks'])('refuses the employee page %s for an admin', (route) => {
    expect(isAllowedChatRoute(route, 'Admin')).toBe(false);
  });

  it.each(['/employee/tasks', '/employee/leaves'])('allows %s for an employee', (route) => {
    expect(isAllowedChatRoute(route, 'Employee')).toBe(true);
  });

  it.each(['/dashboard', '/employees/12', '/employees/12/edit'])('refuses the admin page %s for an employee', (route) => {
    expect(isAllowedChatRoute(route, 'Employee')).toBe(false);
  });

  it.each(['//evil.example', 'https://evil.example', '/employees/../secret', '/employees/abc', 'javascript:alert(1)', ''])(
    'refuses malformed or external target %s for both roles',
    (route) => {
      expect(isAllowedChatRoute(route, 'Admin')).toBe(false);
      expect(isAllowedChatRoute(route, 'Employee')).toBe(false);
    },
  );

  it('refuses everything when no role is known', () => {
    expect(isAllowedChatRoute('/dashboard', null)).toBe(false);
  });
});
