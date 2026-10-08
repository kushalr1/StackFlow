export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  email: string;
  role: 'Admin' | 'Employee';
  employeeId: number | null;
}

export type UserRole = LoginResponse['role'];
