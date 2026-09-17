export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'OnLeave';

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  status: string;
}

export interface AttendanceRequest {
  employeeId: number;
  date: string;
  status: AttendanceStatus;
}
