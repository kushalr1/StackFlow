import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface EmployeeAccount { email: string; isActive: boolean; }

@Injectable({ providedIn: 'root' })
export class EmployeeAccountService {
  private readonly http = inject(HttpClient);
  getAccount(id: number) {
    return this.http.get<EmployeeAccount | null>(`/api/employees/${id}/account`);
  }
  createAccount(id: number, password: string) {
    return this.http.post<EmployeeAccount>(`/api/employees/${id}/account`, { password });
  }
  resetPassword(id: number, password: string) {
    return this.http.put<EmployeeAccount>(`/api/employees/${id}/account/password`, { password });
  }
  setAccess(id: number, isActive: boolean) {
    return this.http.put<EmployeeAccount>(`/api/employees/${id}/account/access`, { isActive });
  }
}
