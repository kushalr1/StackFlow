import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeProfile } from '../models/employee-profile';

@Injectable({ providedIn: 'root' })
export class EmployeeProfileService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>('/api/employee/profile');
  }
}
