import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

// Define tipos para el estado
interface FormData {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  status: string; //  'pending' | 'completed' | ...
}

interface SelectedService {
  item: any; //  TODO: Define un tipo más específico para 'item'
  quantity: number;
  additionalInfo: any; //  TODO: Define un tipo más específico si es posible
}

interface ServiceRequestState {
  formData: FormData;
  selectedServices: SelectedService[];
  loading: boolean;
  error: string | null;
}

// Define el tipo para las acciones
type ServiceRequestAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormData> }
  | { type: "SET_SELECTED_SERVICES"; payload: SelectedService[] }
  | {
      type: "SET_ADDITIONAL_INFO";
      payload: { index: number; additionalInfo: any };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

const ServiceRequestContext = createContext<ServiceRequestContextType | null>(
  null
);

const initialState: ServiceRequestState = {
  formData: {
    name: "",
    nameProject: "",
    location: "",
    identification: "",
    phone: "",
    email: "",
    description: "",
    status: "pending",
  },
  selectedServices: [],
  loading: false,
  error: null,
};

const serviceRequestReducer = (
  state: ServiceRequestState,
  action: ServiceRequestAction
): ServiceRequestState => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case "SET_SELECTED_SERVICES":
      return {
        ...state,
        selectedServices: action.payload,
      };
    case "SET_ADDITIONAL_INFO":
      return {
        ...state,
        selectedServices: state.selectedServices.map((service, i) =>
          i === action.payload.index
            ? { ...service, additionalInfo: action.payload.additionalInfo }
            : service
        ),
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// Define el tipo para el contexto
interface ServiceRequestContextType {
  state: ServiceRequestState;
  setFormData: (formData: Partial<FormData>) => void;
  setSelectedServices: (services: SelectedService[]) => void;
  setAdditionalInfo: (index: number, additionalInfo: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const ServiceRequestProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(serviceRequestReducer, initialState);

  const setFormData = useCallback(
    (formData: Partial<FormData>) => {
      dispatch({ type: "SET_FORM_DATA", payload: formData });
    },
    [dispatch]
  );

  const setSelectedServices = useCallback(
    (services: SelectedService[]) => {
      dispatch({ type: "SET_SELECTED_SERVICES", payload: services });
    },
    [dispatch]
  );

  const setAdditionalInfo = useCallback(
    (index: number, additionalInfo: any) => {
      dispatch({
        type: "SET_ADDITIONAL_INFO",
        payload: { index, additionalInfo },
      });
    },
    [dispatch]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch({ type: "SET_LOADING", payload: loading });
    },
    [dispatch]
  );

  const setError = useCallback(
    (error: string | null) => {
      dispatch({ type: "SET_ERROR", payload: error });
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, [dispatch]);

  const value: ServiceRequestContextType = {
    state,
    setFormData,
    setSelectedServices,
    setAdditionalInfo,
    setLoading,
    setError,
    reset,
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
      "useServiceRequest debe usarse dentro de un ServiceRequestProvider"
    );
  }
  return context;
};
