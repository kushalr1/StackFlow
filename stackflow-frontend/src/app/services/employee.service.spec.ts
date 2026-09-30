import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Employee, EmployeeRequest } from '../models/employee';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  const apiUrl = '/api/employees';
  const employeeRequest: EmployeeRequest = {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '9876543210',
    departmentId: 1,
    jobTitle: 'Developer',
    salary: 75000,
    dateOfJoining: '2026-01-15',
  };
  const employee: Employee = {
    id: 1,
    department: 'Engineering',
    isActive: true,
    relievedDate: null,
    relievingReason: null,
    projectHistory: [],
    ...employeeRequest,
  };

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

  it('should filter employees by department and active status', () => {
    service.getEmployees(undefined, 1, true).subscribe();

    const request = httpTesting.expectOne(
      (candidate) =>
        candidate.url === apiUrl &&
        candidate.params.get('departmentId') === '1' &&
        candidate.params.get('isActive') === 'true',
    );

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

  it('should send a PATCH request to relieve an employee', () => {
    const body = { relievedDate: '2026-09-29', reason: 'Resigned' };
    service.relieveEmployee(1, body).subscribe();

    const request = httpTesting.expectOne(`${apiUrl}/1/relieve`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(body);
    request.flush(null);
  });
});
