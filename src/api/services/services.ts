/**
 * Índice de servicios de API actualizados para NestJS
 */

// Servicios principales
export { projectsService, ProjectsService } from "./projectsService";
export { apiquesService, ApiquesService } from "./apiquesService";
export { profilesService, ProfilesService } from "./profilesService";

// API base
export { default as api } from "../index";

// Re-exportar tipos importantes
export type {
  Project,
  Apique,
  Profile,
  PaginatedResponse,
  ApiResponse,
  User,
  AuthResponse,
} from "@/types/api";
