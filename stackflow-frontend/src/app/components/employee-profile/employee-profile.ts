import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { EmployeeProfile as EmployeeProfileModel } from '../../models/employee-profile';
import { EmployeeProfileService } from '../../services/employee-profile.service';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css',
})
export class EmployeeProfile implements OnInit {
  private readonly employeeProfileService = inject(EmployeeProfileService);

  protected readonly profile = signal<EmployeeProfileModel | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.employeeProfileService
      .getProfile()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (profile) => this.profile.set(profile),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.status === 0
              ? 'The API is unavailable. Confirm that the backend is running.'
              : error.status === 404
                ? 'Your linked employee profile was not found.'
                : 'Your profile could not be loaded. Please try again.',
          );
        },
      });
  }
}
