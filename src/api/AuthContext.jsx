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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('userData'));
                if (!userData) {
                    setAuthState({ isAuthenticated: false, user: null, loading: false });
                    return;
                }
                if (!navigator.onLine) {
                    setAuthState({
                        isAuthenticated: true,
                        user: userData,
                        loading: false,
                    });
                    return;
                }
                const response = await api.get('/auth/verify');
                setAuthState({
                    isAuthenticated: true,
                    user: response.data.user,
                    loading: false,
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    try {
                        const refreshResponse = await api.post('/auth/refresh');
                        if (refreshResponse.status === 200) {
                            const response = await api.get('/auth/verify');
                            setAuthState({
                                isAuthenticated: true,
                                user: response.data.user,
                                loading: false
                            });
                            return;
                        }
                    } catch (refreshError) {
                        console.error('Error al refrescar el token:', refreshError);
                    }
                }
                console.error('Error al verificar la autenticación:', error);
                localStorage.removeItem('userData');
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    loading: false
                });
            }
        };

        checkAuth();
    }, []);

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('userData', JSON.stringify(response.data.user));

            // Verificar si el token CSRF está presente; si no, obtener uno
            let csrfToken = document.cookie
                .split("; ")
                .find((row) => row.startsWith("csrf_token="))
                ?.split("=")[1];
            if (!csrfToken) {
                try {
                    const csrfResponse = await api.get('/auth/csrf');
                    csrfToken = csrfResponse.data.csrfToken;
                    // El backend ya establece la cookie csrf_token, pero podemos confirmar que existe
                    console.log('Token CSRF obtenido:', csrfToken);
                } catch (csrfError) {
                    console.warn('No se pudo obtener el token CSRF:', csrfError);
                    // No fallar el login si el CSRF no se obtiene, ya que no es crítico para todas las acciones
                }
            }

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