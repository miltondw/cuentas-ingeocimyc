import { createContext } from 'react';
import { ServiceRequestContextType } from '../ServiceRequestContext';

/**
 * Contexto para compartir el estado de solicitudes de servicio
 */
export const ServiceRequestContext = createContext<ServiceRequestContextType | null>(null);
