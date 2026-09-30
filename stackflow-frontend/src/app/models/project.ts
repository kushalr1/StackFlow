export type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'OnHold';
export type ProjectPriority = 'Low' | 'Medium' | 'High';
export interface ProjectEmployee {
  id: number; name: string; role: string; assignedOn: string | null;
}
export interface Project {
  id: number; name: string; description: string; startDate: string;
  dueDate: string | null; completedOn: string | null; status: string;
  priority: ProjectPriority; isDelayed: boolean; delayDays: number;
  employees: ProjectEmployee[];
}
export interface ProjectRequest {
  name: string; description: string; startDate: string;
  dueDate: string | null; completedOn: string | null;
  status: ProjectStatus; priority: ProjectPriority;
}

export interface ProjectAssignmentRequest {
  employeeId: number;
  role: string;
}
