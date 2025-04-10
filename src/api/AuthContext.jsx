// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from './index';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        loading: true
    });

    // Verificar autenticación al cargar
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Intentar verificar el token actual
                const response = await api.get('/auth/verify');
                setAuthState({
                    isAuthenticated: true,
                    user: response.data.user,
                    loading: false
                });
            } catch (error) {
                // Token inválido o expirado
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    loading: false
                });
            }
        };

        // Si hay datos en localStorage, verificar que sean válidos
        const userData = JSON.parse(localStorage.getItem('userData') || 'null');
        if (userData) {
            checkAuth();
        } else {
            setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false
            });
        }
    }, []);

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('userData', JSON.stringify(response.data.user));

            setAuthState({
                isAuthenticated: true,
                user: response.data.user,
                loading: false
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || { error: 'Error desconocido' },
                status: error.response?.status
            };
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Siempre limpiar localStorage y estado aunque falle el logout
            localStorage.removeItem('userData');
            setAuthState({
                isAuthenticated: false,
                user: null,
                loading: false
            });
        }
    };

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;