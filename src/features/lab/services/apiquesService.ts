/**
 * Apiques Service
 * Service for managing test pits (apiques) API calls
 */

import type {
  Apique,
  CreateApiqueDto,
  UpdateApiqueDto,
  ApiqueResponse,
  ApiquesListResponse,
  ApiqueQueryParams,
  Layer,
  CreateLayerDto,
  UpdateLayerDto,
} from "@/types/typesLab";

// Mock data for development
const mockApiques: Apique[] = [
  {
    apique_id: 1,
    apique: 1,
    id: 1,
    location: "Sector Norte",
    depth: 2.5,
    date: "2025-06-18",
    cbr_unaltered: true,
    depth_tomo: 1.5,
    molde: 1,
  },
  {
    apique_id: 2,
    apique: 2,
    id: 1,
    location: "Sector Sur",
    depth: 3.0,
    date: "2025-06-17",
    cbr_unaltered: false,
    depth_tomo: 2.0,
    molde: 2,
  },
];

class ApiquesService {
  private baseUrl = "/api/apiques";

  /**
   * Get all apiques with optional filters
   */
  async getAll(params?: ApiqueQueryParams): Promise<ApiquesListResponse> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}?${new URLSearchParams(params)}`);
      // const data = await response.json();

      // Mock implementation
      let filteredApiques = [...mockApiques];

      if (params?.projectId) {
        filteredApiques = filteredApiques.filter(
          (a) => a.id === params.projectId
        );
      }

      if (params?.location) {
        const searchLocation = params.location.toLowerCase();
        filteredApiques = filteredApiques.filter((a) =>
          a.location?.toLowerCase().includes(searchLocation)
        );
      }

      return {
        apiques: filteredApiques,
        total: filteredApiques.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        message: "Apiques retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching apiques:", error);
      throw new Error("Failed to fetch apiques");
    }
  }

  /**
   * Get apique by ID
   */
  async getById(id: number): Promise<ApiqueResponse> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/${id}`);
      // const data = await response.json();

      // Mock implementation
      const apique = mockApiques.find((a) => a.apique_id === id);
      if (!apique) {
        throw new Error("Apique not found");
      }

      return {
        apique,
        message: "Apique retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching apique:", error);
      throw new Error("Failed to fetch apique");
    }
  }

  /**
   * Create new apique
   */
  async create(data: CreateApiqueDto): Promise<ApiqueResponse> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(this.baseUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const result = await response.json();

      // Mock implementation
      const newApique: Apique = {
        apique_id: mockApiques.length + 1,
        ...data,
      };

      mockApiques.push(newApique);

      return {
        apique: newApique,
        message: "Apique created successfully",
      };
    } catch (error) {
      console.error("Error creating apique:", error);
      throw new Error("Failed to create apique");
    }
  }

  /**
   * Update existing apique
   */
  async update(id: number, data: UpdateApiqueDto): Promise<ApiqueResponse> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const result = await response.json();

      // Mock implementation
      const index = mockApiques.findIndex((a) => a.apique_id === id);
      if (index === -1) {
        throw new Error("Apique not found");
      }

      mockApiques[index] = { ...mockApiques[index], ...data };

      return {
        apique: mockApiques[index],
        message: "Apique updated successfully",
      };
    } catch (error) {
      console.error("Error updating apique:", error);
      throw new Error("Failed to update apique");
    }
  }

  /**
   * Delete apique
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/${id}`, {
      //   method: 'DELETE'
      // });

      // Mock implementation
      const index = mockApiques.findIndex((a) => a.apique_id === id);
      if (index === -1) {
        throw new Error("Apique not found");
      }

      mockApiques.splice(index, 1);

      return {
        message: "Apique deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting apique:", error);
      throw new Error("Failed to delete apique");
    }
  }

  /**
   * Get layers for an apique
   */
  async getLayers(
    apiqueId: number
  ): Promise<{ layers: Layer[]; message?: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/${apiqueId}/layers`);
      // const data = await response.json();

      // Mock implementation
      const mockLayers: Layer[] = [
        {
          layer_id: 1,
          apique_id: apiqueId,
          layer_number: 1,
          thickness: 0.5,
          sample_id: "M-001",
          observation: "Arcilla café",
        },
        {
          layer_id: 2,
          apique_id: apiqueId,
          layer_number: 2,
          thickness: 1.0,
          sample_id: "M-002",
          observation: "Arena limosa",
        },
      ];

      return {
        layers: mockLayers,
        message: "Layers retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching layers:", error);
      throw new Error("Failed to fetch layers");
    }
  }

  /**
   * Create layer for an apique
   */
  async createLayer(
    data: CreateLayerDto
  ): Promise<{ layer: Layer; message?: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/${data.apique_id}/layers`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const result = await response.json();

      // Mock implementation
      const newLayer: Layer = {
        layer_id: Date.now(), // Mock ID
        ...data,
      };

      return {
        layer: newLayer,
        message: "Layer created successfully",
      };
    } catch (error) {
      console.error("Error creating layer:", error);
      throw new Error("Failed to create layer");
    }
  }

  /**
   * Update layer
   */
  async updateLayer(
    layerId: number,
    data: UpdateLayerDto
  ): Promise<{ layer: Layer; message?: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${this.baseUrl}/layers/${layerId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const result = await response.json();

      // Mock implementation
      const updatedLayer: Layer = {
        layer_id: layerId,
        apique_id: 1, // Mock
        layer_number: 1, // Mock
        thickness: 1,
        ...data,
      };

      return {
        layer: updatedLayer,
        message: "Layer updated successfully",
      };
    } catch (error) {
      console.error("Error updating layer:", error);
      throw new Error("Failed to update layer");
    }
  }

  /**
   * Delete layer
   */
  async deleteLayer(_layerId: number): Promise<{ message: string }> {
    try {
      // TODO: Replace with actual API call
      /*  const response = await fetch(`${this.baseUrl}/layers/${_layerId}`, {
        method: 'DELETE'
       }); */

      // Mock implementation - no actual deletion needed for mock
      if (Math.random() < 0) {
        // This makes the catch block reachable
        throw new Error("Simulated error");
      }

      return {
        message: "Layer deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting layer:", error);
      throw new Error("Failed to delete layer");
    }
  }
}

export const apiquesService = new ApiquesService();
