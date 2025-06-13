// src/common/types/index.ts
export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isStaff: boolean;
  isSuperuser: boolean;
  roles: UserRoleWithRole[];
}

export interface UserRoleWithRole {
  id: string;
  role: {
    id: string;
    name: string;
  };
}

export interface DeviceWithRoles {
  id: string;
  uuid: string;
  macAddress?: string;
  section?: string;
  location?: string;
  ipAddress?: string;
  apiToken?: string;
  roles: DeviceRoleWithRole[];
}

export interface DeviceRoleWithRole {
  id: string;
  role: {
    id: string;
    name: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}