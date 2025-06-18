/**
 * Perfiles Service
 * Service for managing soil profiles (perfiles) API calls
 */

import type {
  Perfil,
  Profile,
  Blow,
  CreatePerfilDto,
  UpdatePerfilDto,
  CreateProfileDto,
  CreateBlowDto,
  UpdateBlowDto,
  PerfilResponse,
  PerfilesListResponse,
  ProfileResponse,
  ProfilesListResponse,
  BlowResponse,
  BlowsListResponse,
  PerfilQueryParams,
  ProfileQueryParams,
} from "@/types/typesLab";

// Mock data for development
const mockPerfiles: Perfil[] = [
  {
    id: 1,
    project_id: 1,
    sounding_number: "S-001",
    location: "Sector Norte - Punto A",
    profile_date: "2025-06-18",
    samples_number: 5,
    description: "Sondeo exploratorio inicial",
    latitude: 4.6097,
    longitude: -74.0817,
    depth: 6.3,
    water_level: 2.5,
    observations: "Nivel freático encontrado a 2.5m",
    profile_data: {
      soilType: "Arcilla limosa",
      waterContent: 25.5,
      plasticLimit: 18.2,
      liquidLimit: 35.7,
      plasticitIndex: 17.5,
    },
    created_at: "2025-06-18T10:00:00Z",
    updated_at: "2025-06-18T15:30:00Z",
  },
];

const mockProfiles: Profile[] = [
  {
    profile_id: 1,
    project_id: 1,
    sounding_number: "S-001",
    water_level: "2.5m",
    profile_date: "2025-06-18",
    samples_number: 5,
    location: "Sector Norte",
    created_at: "2025-06-18T10:00:00Z",
    updated_at: "2025-06-18T15:30:00Z",
  },
];

const mockBlows: Blow[] = [
  {
    blow_id: 1,
    profile_id: 1,
    depth: 0.45,
    blows6: 3,
    blows12: 5,
    blows18: 8,
    n: 13,
    observation: "Suelo blando",
  },
  {
    blow_id: 2,
    profile_id: 1,
    depth: 0.9,
    blows6: 4,
    blows12: 7,
    blows18: 10,
    n: 17,
    observation: "Aumenta consistencia",
  },
];

class PerfilesService {
  private baseUrl = "/api/perfiles";

  /**
   * Get all perfiles with optional filters
   */
  async getAll(params?: PerfilQueryParams): Promise<PerfilesListResponse> {
    try {
      // TODO: Replace with actual API call
      let filteredPerfiles = [...mockPerfiles];

      if (params?.projectId) {
        filteredPerfiles = filteredPerfiles.filter(
          (p) => p.project_id === params.projectId
        );
      }

      if (params?.soundingNumber) {
        filteredPerfiles = filteredPerfiles.filter((p) =>
          p.sounding_number
            .toLowerCase()
            .includes(params.soundingNumber?.toLowerCase() || "")
        );
      }

      return {
        perfiles: filteredPerfiles,
        total: filteredPerfiles.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        message: "Perfiles retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching perfiles:", error);
      throw new Error("Failed to fetch perfiles");
    }
  }

  /**
   * Get perfil by ID
   */
  async getById(id: number): Promise<PerfilResponse> {
    try {
      const perfil = mockPerfiles.find((p) => p.id === id);
      if (!perfil) {
        throw new Error("Perfil not found");
      }

      return {
        perfil,
        message: "Perfil retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching perfil:", error);
      throw new Error("Failed to fetch perfil");
    }
  }

  /**
   * Create new perfil
   */
  async create(data: CreatePerfilDto): Promise<PerfilResponse> {
    try {
      const newPerfil: Perfil = {
        id: mockPerfiles.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      };

      mockPerfiles.push(newPerfil);

      return {
        perfil: newPerfil,
        message: "Perfil created successfully",
      };
    } catch (error) {
      console.error("Error creating perfil:", error);
      throw new Error("Failed to create perfil");
    }
  }

  /**
   * Update existing perfil
   */
  async update(id: number, data: UpdatePerfilDto): Promise<PerfilResponse> {
    try {
      const index = mockPerfiles.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Perfil not found");
      }

      mockPerfiles[index] = {
        ...mockPerfiles[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return {
        perfil: mockPerfiles[index],
        message: "Perfil updated successfully",
      };
    } catch (error) {
      console.error("Error updating perfil:", error);
      throw new Error("Failed to update perfil");
    }
  }

  /**
   * Delete perfil
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const index = mockPerfiles.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Perfil not found");
      }

      mockPerfiles.splice(index, 1);

      return {
        message: "Perfil deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting perfil:", error);
      throw new Error("Failed to delete perfil");
    }
  }

  /**
   * Get blows for a profile
   */
  async getBlows(profileId: number): Promise<BlowsListResponse> {
    try {
      const blows = mockBlows.filter((b) => b.profile_id === profileId);

      return {
        blows,
        total: blows.length,
        message: "Blows retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching blows:", error);
      throw new Error("Failed to fetch blows");
    }
  }

  /**
   * Create blow for a profile
   */
  async createBlow(data: CreateBlowDto): Promise<BlowResponse> {
    try {
      const newBlow: Blow = {
        blow_id: mockBlows.length + 1,
        ...data,
      };

      mockBlows.push(newBlow);

      return {
        blow: newBlow,
        message: "Blow created successfully",
      };
    } catch (error) {
      console.error("Error creating blow:", error);
      throw new Error("Failed to create blow");
    }
  }

  /**
   * Update blow
   */
  async updateBlow(blowId: number, data: UpdateBlowDto): Promise<BlowResponse> {
    try {
      const index = mockBlows.findIndex((b) => b.blow_id === blowId);
      if (index === -1) {
        throw new Error("Blow not found");
      }

      mockBlows[index] = { ...mockBlows[index], ...data };

      return {
        blow: mockBlows[index],
        message: "Blow updated successfully",
      };
    } catch (error) {
      console.error("Error updating blow:", error);
      throw new Error("Failed to update blow");
    }
  }

  /**
   * Delete blow
   */
  async deleteBlow(blowId: number): Promise<{ message: string }> {
    try {
      const index = mockBlows.findIndex((b) => b.blow_id === blowId);
      if (index === -1) {
        throw new Error("Blow not found");
      }

      mockBlows.splice(index, 1);

      return {
        message: "Blow deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting blow:", error);
      throw new Error("Failed to delete blow");
    }
  }

  /**
   * Legacy Profile methods for backward compatibility
   */

  /**
   * Get all profiles (legacy)
   */
  async getAllProfiles(
    params?: ProfileQueryParams
  ): Promise<ProfilesListResponse> {
    try {
      let filteredProfiles = [...mockProfiles];

      if (params?.projectId) {
        filteredProfiles = filteredProfiles.filter(
          (p) => p.project_id === params.projectId
        );
      }

      return {
        profiles: filteredProfiles,
        total: filteredProfiles.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        message: "Profiles retrieved successfully",
      };
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw new Error("Failed to fetch profiles");
    }
  }

  /**
   * Create new profile (legacy)
   */
  async createProfile(data: CreateProfileDto): Promise<ProfileResponse> {
    try {
      const newProfile: Profile = {
        profile_id: mockProfiles.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data,
      };

      mockProfiles.push(newProfile);

      return {
        profile: newProfile,
        message: "Profile created successfully",
      };
    } catch (error) {
      console.error("Error creating profile:", error);
      throw new Error("Failed to create profile");
    }
  }
}

export const perfilesService = new PerfilesService();
