/**
 * Componentes del feature de cliente
 * Exporta todos los componentes relacionados con solicitudes de servicios
 */

// Componente principal del formulario
export { ClientServiceRequestForm } from "./ClientServiceRequestForm";
export { default as ClientServiceRequestFormDefault } from "./ClientServiceRequestForm";

// Componentes de los pasos del formulario
export { ClientInfoForm } from "./steps/ClientInfoForm";
export { ServiceSelectionForm } from "./steps/ServiceSelectionForm";
export { ProjectDetailsForm } from "./steps/ProjectDetailsForm";
export { ReviewAndConfirmForm } from "./steps/ReviewAndConfirmForm";
export { SuccessStep } from "./steps/SuccessStep";
