// User Profile Types based on backend DTOs

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: number;
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
