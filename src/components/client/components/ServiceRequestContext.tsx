import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { ServiceItem } from "./types";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "@mui/material";

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

interface ServiceRequestContextType {
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
  submitForm: () => Promise<void>;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | null>(
  null
);

export const ServiceRequestProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(serviceRequestReducer, initialState);

  // Persistencia en localStorage con debounce
  const saveState = useCallback(
    debounce((state: ServiceRequestState) => {
      localStorage.setItem("serviceRequestState", JSON.stringify(state));
    }, 500),
    []
  );

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
  }, []);
  const validateForm = useCallback(async () => {
    const {
      name,
      nameProject,
      location,
      identification,
      phone,
      email,
      description,
    } = state.formData;
    const isValid =
      !!name &&
      !!nameProject &&
      !!location &&
      !!identification &&
      /^\d{10}$/.test(phone) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !!description;
    setFormValidity(isValid);
    return isValid;
  }, [
    state.formData.name,
    state.formData.nameProject,
    state.formData.location,
    state.formData.identification,
    state.formData.phone,
    state.formData.email,
    state.formData.description,
    setFormValidity,
  ]);

  const submitForm = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!(await validateForm())) {
        throw new Error("Por favor, complete todos los campos del formulario.");
      }
      // Simula el envío exitoso y limpia el estado
      reset();
    } catch (error: any) {
      setError(error.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  }, [validateForm, setLoading, setError, reset]);

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

export const useServiceRequest = () => {
  const context = useContext(ServiceRequestContext);
  if (!context) {
    throw new Error(
      "useServiceRequest must be used within a ServiceRequestProvider"
    );
  }
  return context;
};
