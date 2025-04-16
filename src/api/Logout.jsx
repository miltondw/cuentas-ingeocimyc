// Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await logout();
                // Limpiar todas las cookies relacionadas
                document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } finally {
                navigate('/login');
            }
        };

        performLogout();
    }, [logout, navigate]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Cerrando sesión...</Typography>
        </Box>
    );
};

export default Logout;