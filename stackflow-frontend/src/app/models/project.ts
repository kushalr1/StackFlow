export type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'OnHold';
export interface ProjectEmployee { id: number; name: string; }
export interface Project {
  id: number; name: string; description: string; startDate: string;
  endDate: string | null; status: string; employees: ProjectEmployee[];
}
export interface ProjectRequest {
  name: string; description: string; startDate: string;
  endDate: string | null; status: ProjectStatus;
}
