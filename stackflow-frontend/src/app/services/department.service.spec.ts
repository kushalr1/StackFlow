import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Department } from '../models/department';
import { DepartmentService } from './department.service';

describe('DepartmentService', () => {
  const apiUrl = 'http://localhost:5090/api/departments';
  const department: Department = {
    id: 1,
    name: 'Engineering',
    description: 'Builds StackFlow',
    employeeCount: 2,
  };
  let service: DepartmentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DepartmentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should get departments', () => {
    service.getDepartments().subscribe((departments) =>
      expect(departments).toEqual([department]),
    );
    const request = httpTesting.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush([department]);
  });

  it('should create a department', () => {
    const body = { name: 'Engineering', description: 'Builds StackFlow' };
    service.createDepartment(body).subscribe();
    const request = httpTesting.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(department);
  });

  it('should update a department', () => {
    const body = { name: 'Engineering', description: 'Updated' };
    service.updateDepartment(1, body).subscribe();
    const request = httpTesting.expectOne(`${apiUrl}/1`);
    expect(request.request.method).toBe('PUT');
    request.flush(null);
  });

  it('should delete a department', () => {
    service.deleteDepartment(1).subscribe();
    const request = httpTesting.expectOne(`${apiUrl}/1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
