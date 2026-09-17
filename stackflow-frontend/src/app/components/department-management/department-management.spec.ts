import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentManagement } from './department-management';

describe('DepartmentManagement', () => {
  let fixture: ComponentFixture<DepartmentManagement>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentManagement],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(DepartmentManagement);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should load departments on initialization', () => {
    fixture.detectChanges();
    const request = httpTesting.expectOne('http://localhost:5090/api/departments');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
