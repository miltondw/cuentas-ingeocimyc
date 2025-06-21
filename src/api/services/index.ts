/**
 * Servicios de API - Índice principal
 * @file services/index.ts
 * @description Exporta todos los servicios de API organizados
 */

// Servicios principales
export { projectsService } from "./projectsService";
export { apiquesService } from "./apiquesService";
export { profilesService } from "./profilesService";
export { adminServiceRequestsService } from "./adminServiceRequestsService";
export { serviceRequestsService } from "./serviceRequestsService";

// Re-exportar tipos principales para conveniencia
export type {
  // Proyectos
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectExpense,
  ProjectFilters,

  // Apiques
  Apique,
  ApiqueLayer,
  CreateApiqueRequest,
  UpdateApiqueRequest,
  ApiqueFilters,

  // Perfiles
  Profile,
  ProfileBlow,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateBlowRequest,
  ProfileFilters,

  // Respuestas
  ApiResponse,
  PaginatedResponse,
  ProjectsListResponse,
  ApiquesListResponse,
  ProfilesListResponse,
} from "@/types/api";
