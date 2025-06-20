/**
 * Índice de servicios de API actualizados para NestJS
 */

// Servicios principales
export { projectsService, ProjectsService } from "./projectsService";
export { apiquesService, ApiquesService } from "./apiquesService";
export { profilesService, ProfilesService } from "./profilesService";
export {
  serviceRequestsService,
  ServiceRequestsService,
} from "./serviceRequestsService";

// API base
export { default as api } from "../index";

// Re-exportar tipos importantes
export type {
  Project,
  Apique,
  Profile,
  ServiceRequest,
  ServiceType,
  ServiceCategory,
  PaginatedResponse,
  ApiResponse,
  User,
  AuthResponse,
} from "@/types/api";
