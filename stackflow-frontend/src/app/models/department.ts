export interface Department {
  id: number;
  name: string;
  description: string;
  employeeCount: number;
}

export type DepartmentRequest = Pick<Department, 'name' | 'description'>;
