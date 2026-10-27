import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { DepartmentManagement } from './components/department-management/department-management';
import { EmployeeDetails } from './components/employee-details/employee-details';
import { EmployeeForm } from './components/employee-form/employee-form';
import { EmployeeList } from './components/employee-list/employee-list';
import { Login } from './components/login/login';
import { Assistant } from './components/assistant/assistant';
import { authGuard, guestGuard, roleGuard } from './guards/auth.guard';
import { AttendanceManagement } from './components/attendance-management/attendance-management';
import { LeaveManagement } from './components/leave-management/leave-management';
import { ProjectManagement } from './components/project-management/project-management';
import { EmployeeDashboard } from './components/employee-dashboard/employee-dashboard';
import { EmployeeProfile } from './components/employee-profile/employee-profile';
import { EmployeeAttendance } from './components/employee-attendance/employee-attendance';
import { EmployeeLeaves } from './components/employee-leaves/employee-leaves';
import { EmployeeProjects } from './components/employee-projects/employee-projects';
import { EmployeeTasks } from './components/employee-tasks/employee-tasks';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [roleGuard('Admin')] },
  { path: 'employees', component: EmployeeList, canActivate: [roleGuard('Admin')] },
  { path: 'employees/add', component: EmployeeForm, canActivate: [roleGuard('Admin')] },
  { path: 'employees/:id/edit', component: EmployeeForm, canActivate: [roleGuard('Admin')] },
  { path: 'employees/:id', component: EmployeeDetails, canActivate: [roleGuard('Admin')] },
  { path: 'departments', component: DepartmentManagement, canActivate: [roleGuard('Admin')] },
  { path: 'attendance', component: AttendanceManagement, canActivate: [roleGuard('Admin')] },
  { path: 'leaves', component: LeaveManagement, canActivate: [roleGuard('Admin')] },
  { path: 'projects', component: ProjectManagement, canActivate: [roleGuard('Admin')] },
  { path: 'employee', component: EmployeeDashboard, canActivate: [roleGuard('Employee')] },
  { path: 'employee/profile', component: EmployeeProfile, canActivate: [roleGuard('Employee')] },
  { path: 'employee/attendance', component: EmployeeAttendance, canActivate: [roleGuard('Employee')] },
  { path: 'employee/leaves', component: EmployeeLeaves, canActivate: [roleGuard('Employee')] },
  { path: 'employee/projects', component: EmployeeProjects, canActivate: [roleGuard('Employee')] },
  { path: 'employee/tasks', component: EmployeeTasks, canActivate: [roleGuard('Employee')] },
  { path: 'assistant', component: Assistant, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
