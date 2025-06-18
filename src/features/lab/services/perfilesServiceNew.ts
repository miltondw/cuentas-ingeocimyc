/**
 * Perfiles Service
 * Service for managing soil profiles (perfiles) API calls
 * Updated to use centralized API interfaces
 */

import type {
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfilesListResponse,
  ProfileBlow,
  CreateBlowRequest,
} from "@/types/api";

// API Endpoints
const API_ENDPOINTS = {
  PROFILES: {
    LIST: "/api/lab/profiles",
    CREATE: "/api/lab/profiles",
    BY_PROJECT: (projectId: number) => `/api/lab/profiles/project/${projectId}`,
    BY_SOUNDING: (projectId: number, soundingNumber: string) =>
      `/api/lab/profiles/project/${projectId}/sounding/${soundingNumber}`,
    DETAIL: (id: number) => `/api/lab/profiles/${id}`,
    UPDATE: (id: number) => `/api/lab/profiles/${id}`,
    DELETE: (id: number) => `/api/lab/profiles/${id}`,
    ADD_BLOW: (profileId: number) => `/api/lab/profiles/${profileId}/blows`,
  },
};

class PerfilesService {
  private baseUrl = API_ENDPOINTS.PROFILES.LIST;

  /**
   * Get all profiles with optional filters
   */
  async getAll(
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ProfilesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw new Error("Failed to fetch profiles");
    }
  }

  /**
   * Get profiles by project ID
   */
  async getByProject(
    projectId: number,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ProfilesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${API_ENDPOINTS.PROFILES.BY_PROJECT(
        projectId
      )}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profiles by project:", error);

      // Return mock data for development
      const mockResponse: ProfilesListResponse = {
        data: [
          {
            id: 1,
            projectId: projectId,
            soundingNumber: "S-001",
            waterLevel: "2.5m",
            profileDate: "2025-06-18",
            samplesNumber: 5,
            location: "Sector Norte",
            created_at: "2025-06-18T10:00:00Z",
            updatedAt: "2025-06-18T10:00:00Z",
            blows: [
              {
                id: 1,
                profileId: 1,
                depth: "0.45",
                blows6: 3,
                blows12: 5,
                blows18: 8,
                n: 13,
                observation: "Suelo blando",
              },
              {
                id: 2,
                profileId: 1,
                depth: "0.90",
                blows6: 4,
                blows12: 7,
                blows18: 10,
                n: 17,
                observation: "Aumenta consistencia",
              },
            ],
          },
        ],
        total: 1,
        page: params?.page ? Number(params.page) : 1,
        limit: params?.limit ? Number(params.limit) : 20,
      };

      return mockResponse;
    }
  }

  /**
   * Get profile by ID
   */
  async getById(profileId: number): Promise<{ data: Profile }> {
    try {
      const url = API_ENDPOINTS.PROFILES.DETAIL(profileId);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);

      // Return mock data for development
      const mockProfile: Profile = {
        id: profileId,
        projectId: 1,
        soundingNumber: "S-001",
        waterLevel: "2.5m",
        profileDate: "2025-06-18",
        samplesNumber: 5,
        location: "Sector Norte",
        created_at: "2025-06-18T10:00:00Z",
        updatedAt: "2025-06-18T10:00:00Z",
        blows: [],
      };

      return { data: mockProfile };
    }
  }

  /**
   * Create new profile
   */
  async create(data: CreateProfileRequest): Promise<{ data: Profile }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating profile:", error);
      throw new Error("Failed to create profile");
    }
  }

  /**
   * Update existing profile
   */
  async update(
    profileId: number,
    data: UpdateProfileRequest
  ): Promise<{ data: Profile }> {
    try {
      const url = API_ENDPOINTS.PROFILES.UPDATE(profileId);
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }
  }

  /**
   * Delete profile
   */
  async delete(profileId: number): Promise<{ message: string }> {
    try {
      const url = API_ENDPOINTS.PROFILES.DELETE(profileId);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw new Error("Failed to delete profile");
    }
  }

  /**
   * Add blow data to profile
   */
  async addBlow(
    profileId: number,
    data: CreateBlowRequest
  ): Promise<{ data: ProfileBlow }> {
    try {
      const url = API_ENDPOINTS.PROFILES.ADD_BLOW(profileId);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding blow data:", error);
      throw new Error("Failed to add blow data");
    }
  }

  /**
   * Get profile by sounding number within a project
   */
  async getBySounding(
    projectId: number,
    soundingNumber: string
  ): Promise<{ data: Profile }> {
    try {
      const url = API_ENDPOINTS.PROFILES.BY_SOUNDING(projectId, soundingNumber);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile by sounding:", error);
      throw new Error("Failed to fetch profile by sounding number");
    }
  }

  /**
   * Get authentication token from storage
   */
  private getToken(): string {
    return localStorage.getItem("accessToken") || "";
  }
}

export const perfilesService = new PerfilesService();
