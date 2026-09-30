export interface Department {
  id: number;
  name: string;
  description: string;
  employeeCount: number;
  relievedEmployeeCount: number;
}

export type DepartmentRequest = Pick<Department, 'name' | 'description'>;
