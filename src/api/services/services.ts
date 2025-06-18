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
  submitServiceRequest,
} from "./serviceRequestsNew";
export {
  gastosMensualesService,
  GastosMensualesService,
} from "./gastosMensualesService";

// Servicios de features nuevos
export { projectsService as financialProjectsService } from "@/features/financial/services/projectsService";

// Contexto de autenticación
export { AuthProvider } from "./components/AuthContext";
export { useAuth } from "./useAuth";

// Componentes de autenticación
export { default as PrivateRoute } from "./components/PrivateRoute";

// API base
export { default as api } from "../index";

// Re-exportar tipos importantes
export type {
  Project,
  Apique,
  Profile,
  ServiceRequest,
  PaginatedResponse,
  ApiResponse,
  User,
  AuthResponse,
} from "@/types/api";

// Re-exportar tipos de gastos mensuales
export type {
  GastoMensual,
  CreateGastoMensualDto,
  GastosMensualesFilters,
} from "./gastosMensualesService";
