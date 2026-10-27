import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChatService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load conversation history from the server', () => {
    service.loadHistory();
    const request = httpTesting.expectOne('/api/chat/messages');
    expect(request.request.method).toBe('GET');

    request.flush([{ role: 'user', content: 'Hi', createdAt: '2026-10-27T10:00:00Z' }]);

    expect(service.messages()).toEqual([{ role: 'user', content: 'Hi', createdAt: '2026-10-27T10:00:00Z' }]);
    expect(service.loading()).toBe(false);
  });

  it('should post the message and append the assistant reply on success', () => {
    service.send('What is my leave balance?');

    const request = httpTesting.expectOne('/api/chat/messages');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ message: 'What is my leave balance?' });

    request.flush({ reply: 'You have 5 days remaining.' });

    const messages = service.messages();
    expect(messages).toEqual([
      { role: 'user', content: 'What is my leave balance?', createdAt: expect.any(String) },
      { role: 'assistant', content: 'You have 5 days remaining.', createdAt: expect.any(String) },
    ]);
    expect(service.busy()).toBe(false);
  });

  it('should never include a client-supplied employee or account id in the request body', () => {
    service.send('What is my leave balance?');

    const request = httpTesting.expectOne('/api/chat/messages');
    const bodyKeys = Object.keys(request.request.body as object);

    expect(bodyKeys).toEqual(['message']);
    request.flush({ reply: 'ok' });
  });

  it('should not send another request while one is already in flight', () => {
    service.send('First question');
    service.send('Second question');

    httpTesting.expectOne('/api/chat/messages');
    httpTesting.verify();
  });

  it('should show an "unavailable" message when the API cannot be reached (status 0)', () => {
    service.send('Hello');

    const request = httpTesting.expectOne('/api/chat/messages');
    request.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(service.error()).toContain('unavailable');
  });

  it('should surface the server-provided error message when available', () => {
    service.send('Hello');

    const request = httpTesting.expectOne('/api/chat/messages');
    request.flush({ message: 'Message must be 1-4000 characters.' }, { status: 400, statusText: 'Bad Request' });

    expect(service.error()).toBe('Message must be 1-4000 characters.');
  });
});
