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

  it('capitalizes while typing and preserves lowercase override on later blur', () => {
    const input = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;
    input.dispatchEvent(new InputEvent('beforeinput', { data: 'k', inputType: 'insertText', bubbles: true, cancelable: true }));
    expect(input.value).toBe('K');
    expect(form.controls['name'].value).toBe('K');
    input.value = '  kushal sharma'; input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    expect(form.controls['name'].value).toBe('  kushal sharma');
  });

  it('does not change existing names in edit mode or other fields', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;
    (component as unknown as { isEditMode: { set(value: boolean): void } }).isEditMode.set(true);
    form.patchValue({ name: 'iPhone', email: 'test@example.com' });
    fixture.nativeElement.querySelector('#name').dispatchEvent(new Event('blur'));
    expect(form.controls['name'].value).toBe('iPhone');
    expect(form.controls['email'].value).toBe('test@example.com');
  });

  it('should block typed phone letters and symbols but allow digits', () => {
    const input = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;
    for (const data of ['a', '+', '-', ' ']) {
      const event = new InputEvent('beforeinput', { data, inputType: 'insertText', bubbles: true, cancelable: true });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
    const digit = new InputEvent('beforeinput', { data: '7', inputType: 'insertText', bubbles: true, cancelable: true });
    input.dispatchEvent(digit);
    expect(digit.defaultPrevented).toBe(false);
  });

  it('should sanitize pasted phone text in both input and form', () => {
    const input = fixture.nativeElement.querySelector('#phone') as HTMLInputElement;
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;
    input.value = '98ab-76 54';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.value).toBe('987654');
    expect(form.controls['phone'].value).toBe('987654');
    expect(form.hasError('countryPhone')).toBe(true);
    input.value = '9876543210';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.hasError('countryPhone')).toBe(false);
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(form.controls['phone'].hasError('required')).toBe(true);
  });

  it('should require the employee name', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

    form.controls['name'].setValue('');
    form.controls['name'].markAsTouched();

    expect(form.controls['name'].hasError('required')).toBe(true);
    expect(form.invalid).toBe(true);
  });

  for (const validName of ['Kushal Sharma', 'Rahul', '  Kushal Sharma  ']) {
    it(`should accept the valid employee name "${validName}"`, () => {
      const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

      form.controls['name'].setValue(validName);

      expect(form.controls['name'].hasError('employeeName')).toBe(false);
    });
  }

  for (const invalidName of [
    '12345',
    'Kushal123',
    '123Kushal',
    'Kushal@123',
    'Kushal#',
    'Kushal_123',
    'Kushal  Sharma',
  ]) {
    it(`should reject the invalid employee name "${invalidName}"`, () => {
      const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

      form.controls['name'].setValue(invalidName);

      expect(form.controls['name'].hasError('employeeName')).toBe(true);
    });
  }

  it('should reject a whitespace-only employee name', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

    form.controls['name'].setValue('   ');

    expect(form.controls['name'].hasError('blank')).toBe(true);
  });

  it('should reject an invalid email address', () => {
    const form = (component as unknown as { employeeForm: FormGroup }).employeeForm;

    form.controls['email'].setValue('not-an-email');
    form.controls['email'].markAsTouched();

    expect(form.controls['email'].hasError('email')).toBe(true);
  });
});
