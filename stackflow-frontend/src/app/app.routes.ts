import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeList } from './components/employee-list/employee-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: Dashboard },
  { path: 'employees', component: EmployeeList },
  { path: 'employees/add', component: EmployeeForm },
  { path: 'employees/:id/edit', component: EmployeeForm },
  { path: 'employees/:id', component: EmployeeDetails },
  { path: '**', redirectTo: 'dashboard' },
];
