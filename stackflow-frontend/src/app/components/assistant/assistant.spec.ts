import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Assistant, displayNameFrom, greetingFor, suggestionsFor } from './assistant';

describe('displayNameFrom', () => {
  it('title-cases a dotted email local part', () => {
    expect(displayNameFrom('priya.sharma@stackflow.local')).toBe('Priya Sharma');
  });

  it('falls back to a generic greeting for an unparseable address', () => {
    expect(displayNameFrom('@stackflow.local')).toBe('there');
  });
});

describe('greetingFor', () => {
  it('greets morning hours', () => {
    expect(greetingFor(8)).toBe('Good morning');
  });

  it('greets afternoon hours', () => {
    expect(greetingFor(14)).toBe('Good afternoon');
  });

  it('greets evening hours', () => {
    expect(greetingFor(20)).toBe('Good evening');
  });
});

describe('suggestionsFor', () => {
  it('returns admin-relevant suggestions for Admin', () => {
    const suggestions = suggestionsFor('Admin');
    expect(suggestions).toContain('Pending leave requests');
    expect(suggestions).not.toContain('My leave balance');
  });

  it('returns self-service suggestions for Employee', () => {
    const suggestions = suggestionsFor('Employee');
    expect(suggestions).toContain('My leave balance');
    expect(suggestions).not.toContain('Pending leave requests');
  });
});

describe('Assistant', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Assistant],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('loads conversation history on init', () => {
    const fixture = TestBed.createComponent(Assistant);
    fixture.detectChanges();

    const request = httpTesting.expectOne('/api/chat/messages');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('sends a suggestion chip as a message when clicked', () => {
    const fixture = TestBed.createComponent(Assistant);
    fixture.detectChanges();
    httpTesting.expectOne('/api/chat/messages').flush([]);

    fixture.componentInstance['ask']('My leave balance');

    const request = httpTesting.expectOne('/api/chat/messages');
    expect(request.request.body).toEqual({ message: 'My leave balance' });
    request.flush({ reply: 'ok' });
  });

  it('does not send an empty draft', () => {
    const fixture = TestBed.createComponent(Assistant);
    fixture.detectChanges();
    httpTesting.expectOne('/api/chat/messages').flush([]);

    fixture.componentInstance['draft'] = '   ';
    fixture.componentInstance['send']();

    httpTesting.expectNone((request) => request.method === 'POST');
  });
});
