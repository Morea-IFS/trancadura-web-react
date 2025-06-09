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

export interface CreateDeviceInput {
  macAddress: string;
}

export interface UpdateDeviceIpInput {
  deviceId: string;
  deviceIp: string;
  apiToken: string;
}

export interface CreatePinCodeInput {
  deviceId: string;
  dateInit: Date;
  dateStop: Date;
}

export interface UnlockWithPinInput {
  deviceId: string;
  pin: number;
}

export interface ApproximationCardInput {
  hexid: string;
  macaddress: string;
}

export interface CreateCardInput {
  hexid: string;
  id: string;
}

export interface ButtonOpenInput {
  deviceId: string;
  apiToken: string;
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

// Express Request com usuário autenticado
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}