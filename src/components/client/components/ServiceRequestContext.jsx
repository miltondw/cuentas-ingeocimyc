import { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';


const ServiceRequestContext = createContext(null);


const initialState = {
    formData: {
        name: '',
        nameProject: '',
        location: '',
        identification: '',
        phone: '',
        email: '',
        description: '',
        status: 'pending',
    },
    selectedServices: [],
    loading: false,
    error: null,
};


const serviceRequestReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FORM_DATA':
            return {
                ...state,
                formData: { ...state.formData, ...action.payload },
            };
        case 'SET_SELECTED_SERVICES':
            return {
                ...state,
                selectedServices: action.payload,
            };
        case 'SET_ADDITIONAL_INFO':
            return {
                ...state,
                selectedServices: state.selectedServices.map((service, i) =>
                    i === action.payload.index
                        ? { ...service, additionalInfo: action.payload.additionalInfo }
                        : service
                ),
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};


export const ServiceRequestProvider = ({ children }) => {
    const [state, dispatch] = useReducer(serviceRequestReducer, initialState);


    const setFormData = useCallback((formData) => {
        dispatch({ type: 'SET_FORM_DATA', payload: formData });
    }, [dispatch]);


    const setSelectedServices = useCallback((services) => {
        dispatch({ type: 'SET_SELECTED_SERVICES', payload: services });
    }, [dispatch]);


    const setAdditionalInfo = useCallback((index, additionalInfo) => {
        dispatch({ type: 'SET_ADDITIONAL_INFO', payload: { index, additionalInfo } });
    }, [dispatch]);


    const setLoading = useCallback((loading) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    }, [dispatch]);


    const setError = useCallback((error) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    }, [dispatch]);


    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, [dispatch]);


    return (
        <ServiceRequestContext.Provider
            value={{
                state,
                setFormData,
                setSelectedServices,
                setAdditionalInfo,
                setLoading,
                setError,
                reset,
            }}
        >
            {children}
        </ServiceRequestContext.Provider>
    );
};


ServiceRequestProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


export const useServiceRequest = () => {
    const context = useContext(ServiceRequestContext);
    if (!context) {
        throw new Error('useServiceRequest debe ser usado dentro de ServiceRequestProvider');
    }
    return context;
};