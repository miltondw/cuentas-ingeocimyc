/**
 * Apiques Service
 * Service for managing test pits (apiques) API calls
 * Updated to use centralized API interfaces
 */

import type {
  Apique,
  CreateApiqueRequest,
  UpdateApiqueRequest,
  ApiquesListResponse,
} from "@/types/api";

// API Endpoints
const API_ENDPOINTS = {
  APIQUES: {
    LIST: "/api/lab/apiques",
    CREATE: "/api/lab/apiques",
    BY_PROJECT: (projectId: number) => `/api/lab/apiques/project/${projectId}`,
    DETAIL: (projectId: number, apiqueId: number) =>
      `/api/lab/apiques/${projectId}/${apiqueId}`,
    UPDATE: (projectId: number, apiqueId: number) =>
      `/api/lab/apiques/${projectId}/${apiqueId}`,
    DELETE: (projectId: number, apiqueId: number) =>
      `/api/lab/apiques/${projectId}/${apiqueId}`,
    STATISTICS: (projectId: number) =>
      `/api/lab/apiques/project/${projectId}/statistics`,
  },
};

class ApiquesService {
  private baseUrl = API_ENDPOINTS.APIQUES.LIST;

  /**
   * Get all apiques with optional filters
   */
  async getAll(
    params?: Record<string, string | number | boolean>
  ): Promise<ApiquesListResponse> {
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
      console.error("Error fetching apiques:", error);
      throw new Error("Failed to fetch apiques");
    }
  }

  /**
   * Get apiques by project ID
   */
  async getByProject(
    projectId: number,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiquesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${API_ENDPOINTS.APIQUES.BY_PROJECT(
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
      console.error("Error fetching apiques by project:", error);

      // Return mock data for development
      const mockResponse: ApiquesListResponse = {
        data: [
          {
            id: 1,
            projectId: projectId,
            apique: 1,
            location: "Sector Norte",
            depth: "2.5",
            date: "2025-06-18",
            cbr_unaltered: 1,
            depth_tomo: "1.5",
            molde: 1,
            created_at: "2025-06-18T10:00:00Z",
            updated_at: "2025-06-18T10:00:00Z",
            layers: [
              {
                id: 1,
                apiqueId: 1,
                layerNumber: 1,
                thickness: "0.5",
                sampleId: "M-001",
                observation: "Arcilla café",
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
   * Get apique by ID
   */
  async getById(apiqueId: number): Promise<{ data: Apique }> {
    try {
      // For now, we'll use a simplified endpoint since we don't have projectId in this context
      const url = `${this.baseUrl}/${apiqueId}`;
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
      console.error("Error fetching apique:", error);

      // Return mock data for development
      const mockApique: Apique = {
        id: apiqueId,
        projectId: 1,
        apique: 1,
        location: "Sector Norte",
        depth: "2.5",
        date: "2025-06-18",
        cbr_unaltered: 1,
        depth_tomo: "1.5",
        molde: 1,
        created_at: "2025-06-18T10:00:00Z",
        updated_at: "2025-06-18T10:00:00Z",
        layers: [],
      };

      return { data: mockApique };
    }
  }

  /**
   * Create new apique
   */
  async create(data: CreateApiqueRequest): Promise<{ data: Apique }> {
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
      console.error("Error creating apique:", error);
      throw new Error("Failed to create apique");
    }
  }

  /**
   * Update existing apique
   */
  async update(
    apiqueId: number,
    data: UpdateApiqueRequest
  ): Promise<{ data: Apique }> {
    try {
      // For now, we'll use a simplified endpoint
      const url = `${this.baseUrl}/${apiqueId}`;
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
      console.error("Error updating apique:", error);
      throw new Error("Failed to update apique");
    }
  }

  /**
   * Delete apique
   */
  async delete(apiqueId: number): Promise<{ message: string }> {
    try {
      // For now, we'll use a simplified endpoint
      const url = `${this.baseUrl}/${apiqueId}`;
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
      console.error("Error deleting apique:", error);
      throw new Error("Failed to delete apique");
    }
  }

  /**
   * Get statistics for project apiques
   */
  async getStatistics(
    projectId: number
  ): Promise<{ data: Record<string, number> }> {
    try {
      const url = API_ENDPOINTS.APIQUES.STATISTICS(projectId);
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
      console.error("Error fetching apiques statistics:", error);
      throw new Error("Failed to fetch apiques statistics");
    }
  }

  /**
   * Get authentication token from storage
   */
  private getToken(): string {
    return localStorage.getItem("accessToken") || "";
  }
}

export const apiquesService = new ApiquesService();
