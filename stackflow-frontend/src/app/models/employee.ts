export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  department: string;
  jobTitle: string;
  salary: number;
  dateOfJoining: string;
  isActive: boolean;
}

export type EmployeeRequest = Omit<Employee, 'id' | 'department'>;
