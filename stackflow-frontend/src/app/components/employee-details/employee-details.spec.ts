import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { EmployeeDetails } from './employee-details';

describe('EmployeeDetails', () => {
  let component: EmployeeDetails;
  let fixture: ComponentFixture<EmployeeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDetails],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates login access and clears the password after success', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EmployeeDetails],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => '7' } } },
      }],
    });
    const details = TestBed.createComponent(EmployeeDetails);
    details.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/employees/7').flush({ id: 7, name: 'Employee A', email: 'employee@example.com', isActive: true, projectHistory: [] });
    http.expectOne('/api/employees/7/account').flush(null);
    details.detectChanges();
    const input = details.nativeElement.querySelector('#account-password');
    input.value = 'long-password-123';
    input.dispatchEvent(new Event('input'));
    details.nativeElement.querySelector('.account-form').dispatchEvent(new Event('submit'));
    const create = http.expectOne('/api/employees/7/account');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ password: 'long-password-123' });
    create.flush({ email: 'employee@example.com', isActive: true });
    details.detectChanges();
    expect(details.nativeElement.textContent).toContain('Login enabled');
    expect(details.nativeElement.querySelector('#account-password')).toBeNull();
    const resetButton = Array.from(details.nativeElement.querySelectorAll('button'))
      .find((button) => (button as HTMLButtonElement).textContent?.includes('Reset Password')) as HTMLButtonElement;
    resetButton.click();
    details.detectChanges();
    const newPassword = details.nativeElement.querySelector('#account-password');
    newPassword.value = 'new-password-123';
    newPassword.dispatchEvent(new Event('input'));
    details.nativeElement.querySelector('.account-form').dispatchEvent(new Event('submit'));
    http.expectNone('/api/employees/7/account/password');
    details.detectChanges();
    expect(details.nativeElement.textContent).toContain('Passwords do not match.');
    const confirmation = details.nativeElement.querySelector('#confirm-password');
    confirmation.value = 'new-password-123';
    confirmation.dispatchEvent(new Event('input'));
    details.nativeElement.querySelector('.account-form').dispatchEvent(new Event('submit'));
    const reset = http.expectOne('/api/employees/7/account/password');
    expect(reset.request.method).toBe('PUT');
    expect(reset.request.body).toEqual({ password: 'new-password-123' });
    reset.flush({ email: 'employee@example.com', isActive: true });
    details.detectChanges();
    expect(details.nativeElement.textContent).toContain('Previous sessions are invalid.');
    const clickButton = (label: string) => {
      const button = Array.from(details.nativeElement.querySelectorAll('button'))
        .find(candidate => (candidate as HTMLButtonElement).textContent?.trim() === label) as HTMLButtonElement;
      button.click(); details.detectChanges();
    };
    clickButton('Disable Login');
    http.expectNone('/api/employees/7/account/access');
    clickButton('Confirm');
    const disable = http.expectOne('/api/employees/7/account/access');
    expect(disable.request.body).toEqual({ isActive: false });
    disable.flush({ email: 'employee@example.com', isActive: false });
    details.detectChanges();
    expect(details.nativeElement.textContent).toContain('Login disabled.');
    clickButton('Enable Login'); clickButton('Confirm');
    const enable = http.expectOne('/api/employees/7/account/access');
    expect(enable.request.body).toEqual({ isActive: true });
    enable.flush({ email: 'employee@example.com', isActive: true });
    details.detectChanges();
    expect(details.nativeElement.textContent).toContain('Login enabled.');
    http.verify();
  });
});
