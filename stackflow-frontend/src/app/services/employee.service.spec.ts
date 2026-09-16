import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Employee, EmployeeRequest } from '../models/employee';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  const apiUrl = 'http://localhost:5090/api/employees';
  const employeeRequest: EmployeeRequest = {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '9876543210',
    department: 'Engineering',
    jobTitle: 'Developer',
    salary: 75000,
    dateOfJoining: '2026-01-15',
    isActive: true,
  };
  const employee: Employee = { id: 1, ...employeeRequest };

  let service: EmployeeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EmployeeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send a GET request for employees', () => {
    service.getEmployees().subscribe((employees) => {
      expect(employees).toEqual([employee]);
    });

    const request = httpTesting.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush([employee]);
  });

  it('should send a POST request to create an employee', () => {
    service.createEmployee(employeeRequest).subscribe((createdEmployee) => {
      expect(createdEmployee).toEqual(employee);
    });

    const request = httpTesting.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(employeeRequest);
    request.flush(employee);
  });

  it('should send a PUT request to update an employee', () => {
    service.updateEmployee(1, employeeRequest).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(employeeRequest);
    request.flush(null);
  });

  it('should send a DELETE request for an employee', () => {
    service.deleteEmployee(1).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
