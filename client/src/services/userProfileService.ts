import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { fetchWithAuth } from "@/lib/api";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "@/types/user-profile";

export const userProfileService = {
  // Get current user profile
  async getCurrentProfile(): Promise<{ success: boolean; data: UserProfile; message: string }> {
    const response = await fetchWithAuth(API_ENDPOINTS.USERS.ME);
    return response.json();
  },

  // Update current user profile
  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; data: UserProfile; message: string }> {
    const response = await fetchWithAuth(API_ENDPOINTS.USERS.ME, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetchWithAuth(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
    });
    return response.json();
  },
};
