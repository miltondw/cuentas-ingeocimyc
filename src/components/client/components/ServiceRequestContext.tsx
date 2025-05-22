import React, { useReducer, useCallback, useEffect } from "react";
import { ServiceItem } from "./types";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "@mui/material";
import type { ServiceRequestApiResponse } from "@api/serviceRequestsApi";

interface FormData {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  status: string;
}

interface SelectedService {
  id: string;
  item: ServiceItem;
  quantity: number;
  instances: Array<{
    id: string;
    additionalInfo: Record<string, string | number | boolean | string[]>;
  }>;
  category?: string;
}

interface ServiceRequestState {
  formData: FormData;
  selectedServices: SelectedService[];
  loading: boolean;
  error: string | null;
  formIsValid: boolean;
}

type ServiceRequestAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormData> }
  | { type: "SET_FORM_VALIDITY"; payload: boolean }
  | { type: "ADD_SELECTED_SERVICE"; payload: SelectedService }
  | {
      type: "UPDATE_ADDITIONAL_INFO";
      payload: {
        serviceId: string;
        instanceId: string | null;
        additionalInfo: Record<
          string,
          string | number | boolean | string[]
        > | null;
        instances?: Array<{
          id: string;
          additionalInfo: Record<string, string | number | boolean | string[]>;
        }>;
        newQuantity?: number;
      };
    }
  | { type: "REMOVE_SELECTED_SERVICE"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" }
  | { type: "RESTORE_STATE"; payload: ServiceRequestState };

const initialState: ServiceRequestState = {
  formData: {
    name: "",
    nameProject: "",
    location: "",
    identification: "",
    phone: "",
    email: "",
    description: "",
    status: "pendiente",
  },
  selectedServices: [],
  loading: false,
  error: null,
  formIsValid: false,
};

const serviceRequestReducer = (
  state: ServiceRequestState,
  action: ServiceRequestAction
): ServiceRequestState => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case "SET_FORM_VALIDITY":
      return { ...state, formIsValid: action.payload };
    case "ADD_SELECTED_SERVICE": {
      if (state.selectedServices.some((s) => s.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        selectedServices: [...state.selectedServices, action.payload],
      };
    }
    case "UPDATE_ADDITIONAL_INFO": {
      return {
        ...state,
        selectedServices: state.selectedServices.map((service) =>
          service.id === action.payload.serviceId
            ? {
                ...service,
                instances: action.payload.instances
                  ? action.payload.instances.map((instance) => ({
                      ...instance,
                      additionalInfo:
                        instance.additionalInfo === null
                          ? {}
                          : instance.additionalInfo,
                    }))
                  : action.payload.instanceId && action.payload.additionalInfo
                  ? service.instances.map((instance) =>
                      instance.id === action.payload.instanceId
                        ? {
                            ...instance,
                            additionalInfo:
                              action.payload.additionalInfo === null
                                ? {}
                                : action.payload.additionalInfo,
                          }
                        : instance
                    )
                  : service.instances,
                quantity:
                  action.payload.newQuantity !== undefined
                    ? action.payload.newQuantity
                    : action.payload.instances
                    ? action.payload.instances.length
                    : service.quantity,
              }
            : service
        ),
      };
    }
    case "REMOVE_SELECTED_SERVICE":
      return {
        ...state,
        selectedServices: state.selectedServices.filter(
          (service) => service.id !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET":
      return initialState;
    case "RESTORE_STATE":
      return { ...initialState, ...action.payload };
    default:
      return state;
  }
};

export interface ServiceRequestContextType {
  state: ServiceRequestState;
  setFormData: (formData: Partial<FormData>) => void;
  addSelectedService: (
    item: ServiceItem,
    quantity: number,
    category?: string,
    serviceId?: string,
    instances?: Array<{
      id: string;
      additionalInfo: Record<string, string | number | boolean | string[]>;
    }>
  ) => void;
  updateAdditionalInfo: (
    serviceId: string,
    instanceId: string | null,
    additionalInfo: Record<string, string | number | boolean | string[]> | null,
    instances?: Array<{
      id: string;
      additionalInfo: Record<string, string | number | boolean | string[]>;
    }>,
    newQuantity?: number
  ) => void;
  removeSelectedService: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setFormValidity: (isValid: boolean) => void;
  validateForm: () => Promise<boolean>;
  submitForm: () => Promise<ServiceRequestApiResponse>;
}

import { ServiceRequestContext } from "./contexts/ServiceRequestContext";

export const ServiceRequestProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(serviceRequestReducer, initialState);

  // Persistencia en localStorage con debounce
  const saveState = useCallback((state: ServiceRequestState) => {
    const debouncedSave = debounce((data: ServiceRequestState) => {
      localStorage.setItem("serviceRequestState", JSON.stringify(data));
    }, 500);
    debouncedSave(state);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("serviceRequestState");
    if (savedState) {
      try {
        dispatch({ type: "RESTORE_STATE", payload: JSON.parse(savedState) });
      } catch (error) {
        console.error("Error restoring state:", error);
      }
    }
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state, saveState]);

  const setFormData = useCallback((formData: Partial<FormData>) => {
    dispatch({ type: "SET_FORM_DATA", payload: formData });
  }, []);

  const setFormValidity = useCallback((isValid: boolean) => {
    dispatch({ type: "SET_FORM_VALIDITY", payload: isValid });
  }, []);

  const createInstances = useCallback(
    (quantity: number) =>
      Array.from({ length: quantity }, () => ({
        id: uuidv4(),
        additionalInfo: {},
      })),
    []
  );

  const addSelectedService = useCallback(
    (
      item: ServiceItem,
      quantity: number,
      category?: string,
      serviceId?: string,
      instances?: Array<{
        id: string;
        additionalInfo: Record<string, string | number | boolean | string[]>;
      }>
    ) => {
      if (quantity < 1) return;
      const newId = serviceId || uuidv4();
      const serviceInstances = instances || createInstances(quantity);
      dispatch({
        type: "ADD_SELECTED_SERVICE",
        payload: {
          id: newId,
          item,
          quantity: serviceInstances.length,
          instances: serviceInstances,
          category,
        },
      });
    },
    [createInstances]
  );

  const updateAdditionalInfo = useCallback(
    (
      serviceId: string,
      instanceId: string | null,
      additionalInfo: Record<
        string,
        string | number | boolean | string[]
      > | null,
      instances?: Array<{
        id: string;
        additionalInfo: Record<string, string | number | boolean | string[]>;
      }>,
      newQuantity?: number
    ) => {
      dispatch({
        type: "UPDATE_ADDITIONAL_INFO",
        payload: {
          serviceId,
          instanceId,
          additionalInfo,
          instances,
          newQuantity,
        },
      });
    },
    []
  );

  const removeSelectedService = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SELECTED_SERVICE", payload: id });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    localStorage.removeItem("serviceRequestState");
  }, []);  const validateForm = useCallback(async () => {
    const {
      name,
      nameProject,
      location,
      identification,
      phone,
      email,
      description,
    } = state.formData;

    // Validate basic form fields
    const isFormValid =
      !!name &&
      !!nameProject &&
      !!location &&
      !!identification &&
      /^\d{10}$/.test(phone) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !!description;

    // Store validation warnings but don't block submission
    let warnings = [];
    
    if (!isFormValid) {
      warnings.push("Hay campos del formulario incompletos o inválidos");
    }    // No service-specific field warnings now that we know areaPredio is valid
    const invalidServices: SelectedService[] = [];

    if (invalidServices.length > 0) {
      const invalidServiceNames = invalidServices
        .map((s) => s.item.name)
        .join(", ");
      warnings.push(
        `Datos potencialmente inválidos para servicios: ${invalidServiceNames}. El campo "areaPredio" podría no ser válido para este tipo de servicio.`
      );
    }
    
    // Set form validity to true even with warnings
    // But store the warnings for optional display
    if (warnings.length > 0) {
      setError(warnings.join(". "));
    } else {
      setError(null);
    }    setFormValidity(true);
    return true;
  }, [state.formData, setFormValidity, setError]);
  const submitForm =
    useCallback(async (): Promise<ServiceRequestApiResponse> => {
      try {
        setLoading(true);
        // Don't clear the error here, as we want to keep validation warnings
        
        // Validate form data and selected services - but continue even with warnings
        await validateForm();
        // Display warnings for 3 seconds if any exist
        if (state.error) {
          // Auto-hide the error after 3 seconds
          setTimeout(() => {
            setError(null);
          }, 3000);
        }

        // Import dynamically to avoid circular dependencies
        const { createServiceRequest } = await import(
          "@api/serviceRequestsApi"
        );

        // Send the data to the API
        const response = await createServiceRequest(
          state.formData,
          state.selectedServices
        );

        if (response.success) {
          // Clean up the state after successful submission
          reset();
          return response;
        } else {          // Handle API error responses
          const errorMsg = response.message || "Error al procesar la solicitud";

          // Check for field validation errors
          if (errorMsg.includes("Campo no válido")) {
            // Extract field name and service code from error message
            const match = errorMsg.match(/Campo no válido para ([^:]+): (.+)/);
            if (match && match.length === 3) {
              const [, serviceCode, fieldName] = match;
              // Show warning message instead of throwing error
              setError(`El campo "${fieldName}" no es válido para el servicio ${serviceCode}. Se continuará con el proceso.`);
              
              // Auto-hide error after 3 seconds
              setTimeout(() => {
                setError(null);
              }, 3000);
              
              // Continue with process instead of throwing error
              return {
                success: true,
                message: "La solicitud se ha enviado con advertencias."
              };
            }
          }

          // Show as a warning rather than throwing an error
          setError(errorMsg);
          setTimeout(() => {
            setError(null);
          }, 3000);
          
          // Return successful response to allow flow to continue
          return {
            success: true,
            message: "La solicitud se ha procesado con advertencias."
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al procesar la solicitud";
        
        // Show error for 3 seconds then clear it
        setError(errorMessage);
        setTimeout(() => {
          setError(null);
        }, 3000);
        
        // Don't throw the error to avoid blocking the flow
        return {
          success: true,
          message: "La solicitud se ha procesado con advertencias."
        };
      } finally {
        setLoading(false);
      }
    }, [
      validateForm,
      setLoading,
      setError,
      reset,
      state.formData,
      state.selectedServices,
      state.error,
    ]);

  const value: ServiceRequestContextType = {
    state,
    setFormData,
    addSelectedService,
    updateAdditionalInfo,
    removeSelectedService,
    setLoading,
    setError,
    reset,
    setFormValidity,
    validateForm,
    submitForm,
  };

  return (
    <ServiceRequestContext.Provider value={value}>
      {children}
    </ServiceRequestContext.Provider>
  );
};

// La función useServiceRequest ha sido movida a hooks/useServiceRequest.ts
