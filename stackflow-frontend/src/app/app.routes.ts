import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { DepartmentManagement } from './components/department-management/department-management';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeList } from './components/employee-list/employee-list';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'employees', component: EmployeeList, canActivate: [authGuard] },
  { path: 'employees/add', component: EmployeeForm, canActivate: [authGuard] },
  { path: 'employees/:id/edit', component: EmployeeForm, canActivate: [authGuard] },
  { path: 'employees/:id', component: EmployeeDetails, canActivate: [authGuard] },
  { path: 'departments', component: DepartmentManagement, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
