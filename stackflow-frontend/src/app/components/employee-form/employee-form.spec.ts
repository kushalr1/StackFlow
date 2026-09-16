import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { EmployeeForm } from './employee-form';

describe('EmployeeForm', () => {
  let component: EmployeeForm;
  let fixture: ComponentFixture<EmployeeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require the employee name', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

    form.controls['name'].setValue('');
    form.controls['name'].markAsTouched();

    expect(form.controls['name'].hasError('required')).toBe(true);
    expect(form.invalid).toBe(true);
  });

  it('should reject an invalid email address', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

    form.controls['email'].setValue('not-an-email');
    form.controls['email'].markAsTouched();

    expect(form.controls['email'].hasError('email')).toBe(true);
  });
});
