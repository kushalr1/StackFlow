import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WritableSignal, Signal } from '@angular/core';
import { ProjectManagement } from './project-management';
import { Employee } from '../../models/employee';
import { Project } from '../../models/project';
import { DropdownOption } from '../shared/dropdown/dropdown';
import { FormGroup } from '@angular/forms';

describe('Project assignment options', () => {
  it('sends the selected team in the same create request without duplicates', () => {
    TestBed.configureTestingModule({
      imports: [ProjectManagement],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const component = TestBed.createComponent(ProjectManagement).componentInstance as unknown as {
      projectForm: FormGroup;
      createEmployeeIds: WritableSignal<number[]>;
      addCreateEmployee: (value: number) => void;
      removeCreateEmployee: (value: number) => void;
      saveProject: () => void;
    };
    component.addCreateEmployee(1);
    component.addCreateEmployee(1);
    component.addCreateEmployee(2);
    component.removeCreateEmployee(1);
    component.projectForm.patchValue({ name: 'New project', startDate: '2026-10-01' });
    component.saveProject();
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/projects');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.employeeIds).toEqual([2]);
    request.flush({ message: 'test failure' }, { status: 409, statusText: 'Conflict' });
    expect(component.createEmployeeIds()).toEqual([2]);
    http.verify();
  });

  it('reuses options and refreshes after team or employee changes', () => {
    TestBed.configureTestingModule({
      imports: [ProjectManagement],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const component = TestBed.createComponent(ProjectManagement).componentInstance as unknown as {
      employees: WritableSignal<Employee[]>;
      projects: WritableSignal<Project[]>;
      expandedProjectId: WritableSignal<number | null>;
      selectedAssignmentOptions: Signal<DropdownOption[]>;
      busyId: WritableSignal<number | null>;
    };
    const employee = (id: number, name: string) => ({ id, name } as Employee);
    const project = { id: 1, status: 'Active', employees: [{ id: 1 }] } as Project;
    component.employees.set([employee(1, 'Assigned'), employee(2, 'Available')]);
    component.projects.set([project]);
    component.expandedProjectId.set(1);
    const first = component.selectedAssignmentOptions();
    expect(first.map(option => option.value)).toEqual([0, 2]);
    component.busyId.set(1);
    expect(component.selectedAssignmentOptions()).toBe(first);
    component.projects.set([{ ...project, employees: [] }]);
    expect(component.selectedAssignmentOptions().map(option => option.value)).toEqual([0, 1, 2]);
    component.employees.set([employee(2, 'Renamed')]);
    expect(component.selectedAssignmentOptions()).toEqual([
      { value: 0, label: 'Select employee' }, { value: 2, label: 'Renamed' },
    ]);
  });
});
