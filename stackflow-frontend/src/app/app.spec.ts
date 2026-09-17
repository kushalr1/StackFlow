import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should provide a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the primary navigation links', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    sessionStorage.setItem('stackflow_admin_token', `header.${payload}.signature`);
    sessionStorage.setItem('stackflow_admin_email', 'admin@stackflow.local');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('nav > *');

    expect(items).toHaveLength(6);
  });
});
