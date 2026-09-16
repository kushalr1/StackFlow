export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  salary: number;
  dateOfJoining: string;
  isActive: boolean;
}

export type EmployeeRequest = Omit<Employee, 'id'>;
