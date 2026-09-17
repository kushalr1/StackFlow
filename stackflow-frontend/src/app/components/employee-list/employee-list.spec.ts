import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EmployeeList } from './employee-list';

describe('EmployeeList', () => {
  let component: EmployeeList;
  let fixture: ComponentFixture<EmployeeList>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeList);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request employees when the component initializes', () => {
    fixture.detectChanges();

    const departmentRequest = httpTesting.expectOne(
      'http://localhost:5090/api/departments',
    );
    const employeeRequest = httpTesting.expectOne(
      'http://localhost:5090/api/employees',
    );
    expect(departmentRequest.request.method).toBe('GET');
    expect(employeeRequest.request.method).toBe('GET');
    departmentRequest.flush([]);
    employeeRequest.flush([]);
  });
});
