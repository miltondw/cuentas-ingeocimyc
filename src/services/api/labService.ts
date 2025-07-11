/**
 * Actualizar el estado de un ensayo asignado a un proyecto
 * @param projectId ID del proyecto
 * @param assayAssignmentId ID de la asignación (project_assays)
 * @param status Nuevo estado: "pendiente" | "en_proceso" | "completado"
 */
export async function updateProjectAssayStatus(
  projectId: number,
  assayAssignmentId: number,
  status: "pendiente" | "en_proceso" | "completado"
): Promise<void> {
  await apiClient.patch(
    `/projects/${projectId}/assays/${assayAssignmentId}/status`,
    { status }
  );
}

/**
 * Actualizar el estado global de un proyecto
 * @param projectId ID del proyecto
 * @param estado Nuevo estado: "activo" | "completado" | "cancelado" | "pausado"
 */
export async function updateProjectStatus(
  projectId: number,
  estado: "activo" | "completado" | "cancelado" | "pausado"
): Promise<void> {
  await apiClient.patch(`/projects/${projectId}/estado`, { estado });
}
// Obtener ensayos por categoría

import { apiClient } from "@/lib/axios/apiClient";
import type { LabProjectFilters, ProfilesFilters } from "@/types/labFilters";
import type {
  LabProject,
  AssayInfo,
  Assay,
  LabProjectsResponse,
} from "@/features/lab/pages/ProjectsDashboard/types/ProjectsDashboard.types";
import type { CreateProjectDto } from "@/types/typesProject/projectTypes";

// Interfaces basadas en las respuestas reales de la API
export interface ApiqueProject {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  obrero: string;
  fecha: string;
  estado: string;
  total_apiques: number;
  apiques: ApiqueData[];
}

// Tipos importados desde types/ProjectsDashboard.types.ts

export interface ApiqueData {
  apique_id: number;
  apique: number;
  location: string;
  depth: string;
  date: string;
  cbr_unaltered: number | boolean; // <-- Puede ser booleano o número
  depth_tomo: string;
  molde: number | null; // <-- Puede ser null
  total_layers?: number; // <-- Opcional, algunos endpoints pueden no enviarlo
  layers: ApiqueLayer[];
}

export interface ApiqueLayer {
  id: number;
  apiqueId: number;
  layerNumber: number;
  thickness: string;
  sampleId: string | null;
  observation: string | null;
}

export interface ProfileProject {
  id: number;
  projectId: number;
  soundingNumber: string;
  waterLevel: string;
  profileDate: string;
  samplesNumber: number;
  location: string | null;
  created_at: string;
  updatedAt: string;
  project?: {
    id: number;
    fecha: string;
    solicitante: string;
    nombreProyecto: string;
    obrero: string;
    costoServicio: string;
    abono: string;
    factura: string;
    valorRetencion: string | null;
    metodoDePago: string;
    estado: string;
    created_at: string;
  };
  blows: ProfileBlow[];
}

export interface ProfileBlow {
  id: number;
  profileId: number;
  depth: string;
  blows6: number;
  blows12: number;
  blows18: number;
  n: number;
  observation: string | null;
}

export interface ProfilesResponse {
  data: ProfileProject[];
  total: number;
  page: number;
  limit: number;
}
export interface CreateProjectPayload {
  client: string;
  identification: string;
  assays: number[];
  // Agrega aquí otros campos requeridos por el backend
}

// Función auxiliar para construir parámetros de consulta
const buildQueryParams = (
  filters: LabProjectFilters | ProfilesFilters | Record<string, unknown>
): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    // Solo excluir undefined, null, y strings vacíos
    // Permitir false y 0 como valores válidos
    if (value !== undefined && value !== null && value !== "") {
      // No enviar el estado "todos" al backend
      if (key === "estado" && value === "todos") {
        return;
      }

      // Convertir booleanos y números a string apropiadamente
      if (typeof value === "boolean") {
        params.append(key, value.toString());
      } else if (typeof value === "number") {
        params.append(key, value.toString());
      } else if (typeof value === "string") {
        params.append(key, value);
      }
    }
  });

  console.info(
    "🔧 Parámetros construidos para el backend:",
    Object.fromEntries(params.entries())
  );
  return params;
};

export const labService = {
  /**
   * Obtener todos los proyectos con apiques (con filtros completos)
   */
  async getApiques(filters?: LabProjectFilters): Promise<ApiqueProject[]> {
    console.info("🔄 Llamando a /lab/apiques con filtros:", filters);
    try {
      let url = "/lab/apiques";

      if (filters) {
        const params = buildQueryParams(filters);
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<{ data: ApiqueProject[] }>(url);
      console.info("✅ Respuesta de /lab/apiques:", response.data);
      return response.data.data; // <-- Solo la data anidada
    } catch (error) {
      console.error("❌ Error en /lab/apiques:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los profiles (con filtros completos)
   */
  async getProfiles(filters?: ProfilesFilters): Promise<ProfileProject[]> {
    console.info("🔄 Llamando a /lab/profiles con filtros:", filters);
    try {
      let url = "/lab/profiles";

      if (filters) {
        const params = buildQueryParams(filters);
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<ProfilesResponse>(url);
      console.info("✅ Respuesta de /lab/profiles:", response.data);
      return response.data.data; // <-- Solo la data anidada (array)
    } catch (error) {
      console.error("❌ Error en /lab/profiles:", error);
      throw error;
    }
  },

  /**
   * Obtener proyectos combinados (mezcla información de apiques y profiles)
   */
  async getLabProjects(filters?: LabProjectFilters): Promise<{
    projects: ApiqueProject[];
    profiles: ProfileProject[];
    combinedData: Array<ApiqueProject & { profilesCount: number }>;
  }> {
    console.info(
      "🔄 Obteniendo datos combinados de laboratorio con filtros:",
      filters
    );

    try {
      // Llamar a ambos endpoints en paralelo
      const [apiquesResponse, profilesResponse] = await Promise.allSettled([
        this.getApiques(filters),
        this.getProfiles(
          filters
            ? {
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy as ProfilesFilters["sortBy"],
                sortOrder: filters.sortOrder,
                startDate: filters.startDate,
                endDate: filters.endDate,
                location: filters.solicitante, // Mapear solicitante a location temporalmente
              }
            : undefined
        ),
      ]);

      const projects =
        apiquesResponse.status === "fulfilled" ? apiquesResponse.value : [];
      const profilesArray =
        profilesResponse.status === "fulfilled" ? profilesResponse.value : [];

      // Crear un mapa de profiles por proyecto para facilitar el acceso
      const profilesByProject = profilesArray.reduce((acc, profile) => {
        if (!acc[profile.projectId]) {
          acc[profile.projectId] = [];
        }
        acc[profile.projectId].push(profile);
        return acc;
      }, {} as Record<number, ProfileProject[]>);

      // Combinar datos
      const combinedData = projects.map((project) => ({
        ...project,
        profilesCount: profilesByProject[project.proyecto_id]?.length || 0,
      }));

      return {
        projects,
        profiles: profilesArray, // <-- Siempre un array
        combinedData,
      };
    } catch (error) {
      console.error("❌ Error obteniendo datos combinados:", error);
      throw error;
    }
  },

  /**
   * Obtener un apique específico por ID
   */
  async getApique(apiqueId: number, projectId: number): Promise<ApiqueData> {
    try {
      const response = await apiClient.get<{ data: ApiqueData }>(
        `/lab/apiques/${projectId}/${apiqueId}`
      );
      console.info("✅ Respuesta de getApique:", response.data);
      return response.data.data; // <-- Solo la data anidada
    } catch (error) {
      console.error("❌ Error en getApique:", error);
      throw error;
    }
  },
  /**
   * Crear un nuevo apique
   */
  async createApique(apiqueData: Record<string, unknown>): Promise<ApiqueData> {
    console.info("🔄 Llamando a POST /lab/apiques...");
    try {
      const response = await apiClient.post<ApiqueData>(
        "/lab/apiques",
        apiqueData
      );
      console.info("✅ Respuesta de createApique:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en createApique:", error);
      throw error;
    }
  },

  /**
   * Actualizar un apique existente
   */
  async updateApique(
    apiqueId: number,
    projectId: number,
    apiqueData: Record<string, unknown>
  ): Promise<ApiqueData> {
    console.info(`🔄 Llamando a PUT /lab/apiques/${apiqueId}...`);
    try {
      const response = await apiClient.put<ApiqueData>(
        `/lab/apiques/${projectId}/${apiqueId}`,
        apiqueData
      );
      console.info("✅ Respuesta de updateApique:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en updateApique:", error);
      throw error;
    }
  },

  /**
   * Eliminar un apique
   */
  async deleteApique(apiqueId: number, projectId: number): Promise<void> {
    console.info(`🔄 Llamando a DELETE /lab/apiques/${apiqueId}...`);
    try {
      await apiClient.delete(`/lab/apiques/${projectId}/${apiqueId}`);
      console.info("✅ Apique eliminado correctamente");
    } catch (error) {
      console.error("❌ Error en deleteApique:", error);
      throw error;
    }
  },
  /**
   * Obtener apiques de un proyecto específico
   */
  async getProjectApiques(
    projectId: number,
    filters?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }
  ): Promise<{
    data: Array<{
      apique_id: number;
      proyecto_id: number;
      apique: number;
      location: string;
      depth: string;
      date: string;
      molde: number | null;
      cbr_unaltered?: boolean;
      depth_tomo?: string;
      layers: Array<{
        id: number;
        apiqueId: number;
        layerNumber: number;
        thickness: string;
        sampleId: string | null;
        observation: string | null;
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    console.info(
      `🔄 Llamando a /lab/apiques/project/${projectId} con filtros:`,
      filters
    );
    try {
      let url = `/lab/apiques/project/${projectId}`;

      if (filters) {
        const params = buildQueryParams(filters);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      const response = await apiClient.get<{
        data: {
          data: Array<{
            apique_id: number;
            proyecto_id: number;
            apique: number;
            location: string;
            depth: string;
            date: string;
            molde: number | null;
            cbr_unaltered?: boolean;
            depth_tomo?: string;
            layers: Array<{
              id: number;
              apiqueId: number;
              layerNumber: number;
              thickness: string;
              sampleId: string | null;
              observation: string | null;
            }>;
          }>;
          total: number;
          page: number;
          limit: number;
        };
      }>(url);
      console.info("✅ Respuesta de getProjectApiques:", response.data);
      // Acceder a response.data.data para obtener el objeto paginado real
      return response.data.data;
    } catch (error) {
      console.error("❌ Error en getProjectApiques:", error);
      throw error;
    }
  },

  /**
   * Obtener un perfil específico por ID
   */
  async getProfile(profileId: number): Promise<ProfileProject> {
    console.info(`🔄 Llamando a /lab/profiles/${profileId}...`);
    try {
      const response = await apiClient.get<{ data: ProfileProject }>(
        `/lab/profiles/${profileId}`
      );
      console.info("✅ Respuesta de getProfile:", response.data);
      return response.data.data; // <-- Solo la data anidada, tipado seguro
    } catch (error) {
      console.error("❌ Error en getProfile:", error);
      throw error;
    }
  },

  /**
   * Crear un nuevo perfil
   */
  async createProfile(
    profileData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.info("🔄 Llamando a POST /lab/profiles...");
    try {
      const response = await apiClient.post("/lab/profiles", profileData);
      console.info("✅ Respuesta de createProfile:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en createProfile:", error);
      throw error;
    }
  },

  /**
   * Actualizar un perfil existente
   */
  async updateProfile(
    profileId: number,
    profileData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.info(`🔄 Llamando a PATCH /lab/profiles/${profileId}...`);
    try {
      const response = await apiClient.patch(
        `/lab/profiles/${profileId}`,
        profileData
      );
      console.info("✅ Respuesta de updateProfile:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en updateProfile:", error);
      throw error;
    }
  },

  /**
   * Eliminar un perfil
   */
  async deleteProfile(profileId: number): Promise<void> {
    console.info(`🔄 Llamando a DELETE /lab/profiles/${profileId}...`);
    try {
      await apiClient.delete(`/lab/profiles/${profileId}`);
      console.info("✅ Perfil eliminado correctamente");
    } catch (error) {
      console.error("❌ Error en deleteProfile:", error);
      throw error;
    }
  },

  /**
   * Obtener perfiles de un proyecto específico
   */
  async getProjectProfiles(
    projectId: number,
    filters?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }
  ): Promise<{
    data: Array<{
      id: number;
      projectId: number;
      soundingNumber: string;
      waterLevel: string;
      profileDate: string;
      samplesNumber: number;
      location: string | null;
      blows: Array<{
        id: number;
        profileId: number;
        depth: string;
        blows6: number;
        blows12: number;
        blows18: number;
        n: number;
        observation: string | null;
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    console.info(
      `🔄 Llamando a /lab/profiles/project/${projectId} con filtros:`,
      filters
    );
    try {
      let url = `/lab/profiles/project/${projectId}`;

      if (filters) {
        const params = buildQueryParams(filters);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await apiClient.get(url);
      console.info("✅ Respuesta de getProjectProfiles:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en getProjectProfiles:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los proyectos (con filtros completos) - Nuevo método
   */
  async getAllProjects(
    filters?: LabProjectFilters
  ): Promise<LabProjectsResponse> {
    console.info("🔄 Llamando a /api/lab/projects con filtros:", filters);
    try {
      let url = "/api/lab/projects";

      if (filters) {
        const params = buildQueryParams(filters);
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<LabProjectsResponse>(url);
      console.info("✅ Respuesta de /api/lab/projects:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en /api/lab/projects:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los proyectos del nuevo endpoint /lab/projects (con filtros completos)
   */ async getProjects(
    filters?: LabProjectFilters
  ): Promise<LabProjectsResponse> {
    // Adaptado para consumir el nuevo endpoint /api/lab/projects/with-samples
    try {
      let url = "/lab/projects/with-samples";
      if (filters) {
        const params = buildQueryParams(filters);
        url += `?${params.toString()}`;
      }
      const response = await apiClient.get<{ data: LabProjectsResponse }>(url);
      // Asegura que todos los proyectos tengan los campos requeridos
      const data = response.data.data;
      if (Array.isArray(data.data)) {
        data.data = data.data.map((proj: LabProject) => ({
          ...proj,
          assigned_assays: Array.isArray(proj.assigned_assays)
            ? proj.assigned_assays.map((ensayo: AssayInfo) => ({
                ...ensayo,
                assay: {
                  ...ensayo.assay,
                  category:
                    Array.isArray(ensayo?.assay?.categories) &&
                    ensayo?.assay.categories.length > 0
                      ? ensayo?.assay.categories[0]
                      : null,
                } as Assay,
              }))
            : [],
          apique_ids: proj.apique_ids || [],
          profile_ids: proj.profile_ids || [],
        }));
      }
      return data;
    } catch (error) {
      console.error("❌ Error en /api/lab/projects/with-samples:", error);
      throw error;
    }
  },
  /**
   * Obtener ensayos por categoría (filtrando localmente del endpoint agrupado)
   * @deprecated Ya no hace petición, solo filtra del array global
   */
  getAssaysByCategoryFromGroup(
    allCategoryAssays: {
      category: { id: number; code: string; name: string };
      ensayos: { id: number; code: string; name: string }[];
    }[],
    categoryId: number
  ) {
    const found = allCategoryAssays.find((d) => d.category.id === categoryId);
    return found && found.ensayos ? found.ensayos : [];
  },

  /**
   * Crear un nuevo proyecto (financiero)
   */
  async createProject(
    payload: CreateProjectDto & {
      assignedAssays: { assayId: number }[];
    }
  ): Promise<{ id: number }> {
    try {
      const response = await apiClient.post<{ data: { id: number } }>(
        "/projects",
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("❌ Error en createProject:", error);
      throw error;
    }
  },

  /**
   * Obtener ensayos agrupados por categoría (nuevo endpoint)
   */
  async getAssaysByCategoryGroup(): Promise<
    {
      category: { id: number; code: string; name: string };
      ensayos: { id: number; code: string; name: string }[];
    }[]
  > {
    try {
      const response = await apiClient.get<{
        data: {
          data: {
            category: { id: number; code: string; name: string };
            ensayos: { id: number; code: string; name: string }[];
          }[];
        };
      }>("/lab/assays/by-category");
      // Retorna solo el array de categorías con sus ensayos
      return response.data.data.data;
    } catch (error) {
      console.error("❌ Error en getAssaysByCategoryGroup:", error);
      throw error;
    }
  },
};
