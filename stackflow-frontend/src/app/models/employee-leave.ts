export type EmployeeLeaveType = 'CasualLeave' | 'SickLeave' | 'PaidLeave' | 'Other';
export type EmployeeLeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface EmployeeLeave {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: EmployeeLeaveStatus;
  appliedOn: string;
}

export interface CreateEmployeeLeave {
  leaveType: EmployeeLeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
