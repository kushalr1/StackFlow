import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EmployeeAttendance } from '../../models/employee-attendance';
import { EmployeeLeave } from '../../models/employee-leave';
import { EmployeeProfile } from '../../models/employee-profile';
import { EmployeeAttendanceService } from '../../services/employee-attendance.service';
import { EmployeeLeaveService } from '../../services/employee-leave.service';
import { EmployeeProfileService } from '../../services/employee-profile.service';
import { EmployeeProject, EmployeeProjectService } from '../../services/employee-project.service';

@Component({
  selector: 'app-employee-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  private readonly profileService = inject(EmployeeProfileService);
  private readonly attendanceService = inject(EmployeeAttendanceService);
  private readonly leaveService = inject(EmployeeLeaveService);
  private readonly projectService = inject(EmployeeProjectService);
  protected readonly month = new Date();
  protected readonly profile = signal<EmployeeProfile | null>(null);
  protected readonly attendance = signal<EmployeeAttendance[]>([]);
  protected readonly leaves = signal<EmployeeLeave[]>([]);
  protected readonly projects = signal<EmployeeProject[]>([]);
  protected readonly loading = signal({ profile: true, attendance: true, leaves: true, projects: true });
  protected readonly errors = signal({ profile: false, attendance: false, leaves: false, projects: false });
  protected readonly present = computed(() => this.attendance().filter(record => record.status === 'Present').length);
  protected readonly pending = computed(() => this.leaves().filter(leave => leave.status === 'Pending').length);
  protected readonly approved = computed(() => this.leaves().filter(leave => leave.status === 'Approved').length);
  protected readonly currentProjects = computed(() => this.projects().filter(project => project.status !== 'Completed' && !project.removedOn));
  protected readonly completedProjects = computed(() => this.projects().filter(project => project.status === 'Completed').length);

  ngOnInit(): void {
    this.profileService.getProfile().pipe(finalize(() => this.finish('profile'))).subscribe({
      next: profile => this.profile.set(profile), error: () => this.fail('profile'),
    });
    this.attendanceService.getMonthly(this.month.getFullYear(), this.month.getMonth() + 1)
      .pipe(finalize(() => this.finish('attendance'))).subscribe({
        next: records => this.attendance.set(records), error: () => this.fail('attendance'),
      });
    this.leaveService.getLeaves().pipe(finalize(() => this.finish('leaves'))).subscribe({
      next: leaves => this.leaves.set(leaves), error: () => this.fail('leaves'),
    });
    this.projectService.getProjects().pipe(finalize(() => this.finish('projects'))).subscribe({
      next: projects => this.projects.set(projects), error: () => this.fail('projects'),
    });
  }

  private finish(section: 'profile' | 'attendance' | 'leaves' | 'projects'): void {
    this.loading.update(value => ({ ...value, [section]: false }));
  }

  private fail(section: 'profile' | 'attendance' | 'leaves' | 'projects'): void {
    this.errors.update(value => ({ ...value, [section]: true }));
  }
}
