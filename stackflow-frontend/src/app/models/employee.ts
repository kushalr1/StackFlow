export interface EmployeeProjectHistory {
  projectId: number;
  projectName: string;
  projectStatus: string;
  role: string;
  assignedOn: string | null;
  removedOn: string | null;
  isCurrent: boolean;
}

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
  relievedDate: string | null;
  relievingReason: string | null;
  projectHistory: EmployeeProjectHistory[];
}

export type EmployeeRequest = Omit<
  Employee,
  'id' | 'department' | 'isActive' | 'relievedDate' | 'relievingReason' | 'projectHistory'
>;

export interface RelieveEmployeeRequest {
  relievedDate: string;
  reason: string | null;
}
