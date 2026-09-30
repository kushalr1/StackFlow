import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProjectService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('filters projects by status', () => {
    service.getProjects('Active').subscribe();
    const request = http.expectOne('/api/projects?status=Active');
    expect(request.request.method).toBe('GET'); request.flush([]);
  });
  it('assigns an employee', () => {
    const body = { employeeId: 7, role: 'Developer' };
    service.assignEmployee(3, body).subscribe();
    const request = http.expectOne('/api/projects/3/employees');
    expect(request.request.body).toEqual(body); request.flush(null);
  });
});
