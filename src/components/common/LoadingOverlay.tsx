import React, { ReactNode } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Card,
  CardContent,
  Stack,
  Skeleton,
  useTheme,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
} from '@mui/icons-material';

interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  
  // Loading configuration
  type?: 'overlay' | 'inline' | 'skeleton' | 'minimal';
  variant?: 'indeterminate' | 'determinate';
  progress?: number;
  
  // Content
  message?: string;
  description?: string;
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  backdrop?: boolean;
  
  // Advanced features
  showNetworkStatus?: boolean;
  retryAction?: () => void;
  cancelAction?: () => void;
  
  // Animation
  timeout?: number;
  delay?: number;
}

interface LoadingStateProps {
  type: string;
  variant: string;
  progress?: number;
  message?: string;
  description?: string;
  size: string;
  color: string;
  showNetworkStatus?: boolean;
  retryAction?: () => void;
  cancelAction?: () => void;
}

// Componente de estado de red
const NetworkStatus: React.FC<{ isOnline?: boolean }> = ({ isOnline = navigator.onLine }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
      {isOnline ? (
        <>
          <ConnectedIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
          <Typography variant="caption" color="success.main">
            Conectado
          </Typography>
        </>
      ) : (
        <>
          <DisconnectedIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
          <Typography variant="caption" color="error.main">
            Sin conexión
          </Typography>
        </>
      )}
    </Box>
  );
};

// Componente de progreso circular con información
const CircularProgressWithLabel: React.FC<{
  value?: number;
  size: string;
  color: string;
}> = ({ value, size, color }) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>      <CircularProgress
        variant={value !== undefined ? 'determinate' : 'indeterminate'}
        value={value}
        size={getSize()}
        color={color as 'primary' | 'secondary' | 'inherit'}
        thickness={4}
      />
      {value !== undefined && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            fontSize="0.7rem"
            fontWeight="bold"
          >
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Componente de estado de carga principal
const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  variant,
  progress,
  message,
  description,
  size,
  color,
  showNetworkStatus,
}) => {
  // Skeleton loader
  if (type === 'skeleton') {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="60%" height={32} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Stack>
      </Box>
    );
  }
  // Minimal loader
  if (type === 'minimal') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={size === 'small' ? 20 : 24} color={color as 'primary' | 'secondary' | 'inherit'} />
      </Box>
    );
  }

  // Full loading state
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        minHeight: type === 'overlay' ? '200px' : 'auto',
      }}
    >
      <Zoom in timeout={300}>
        <Box sx={{ mb: 2 }}>
          {variant === 'determinate' && progress !== undefined ? (
            <Stack spacing={2} alignItems="center">              <CircularProgressWithLabel
                value={progress}
                size={size}
                color={color}
              />
              <Box sx={{ width: '200px' }}>                <LinearProgress
                  variant="determinate"
                  value={progress}
                  color={color as 'primary' | 'secondary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Stack>
          ) : (            <CircularProgressWithLabel
              size={size}
              color={color}
            />
          )}
        </Box>
      </Zoom>

      {message && (
        <Typography
          variant={size === 'large' ? 'h6' : 'body1'}
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 300, mb: 2 }}
        >
          {description}
        </Typography>
      )}

      {showNetworkStatus && <NetworkStatus />}
    </Box>
  );
};

// Componente principal LoadingOverlay
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  type = 'overlay',
  variant = 'indeterminate',
  progress,
  message = 'Cargando...',
  description,
  size = 'medium',
  color = 'primary',
  backdrop = true,
  showNetworkStatus = false,
  timeout = 300,
  delay = 0,
}) => {
  const [showLoading, setShowLoading] = React.useState(false);
  // Handle delay
  React.useEffect(() => {
    let timer: number;
    
    if (loading && delay > 0) {
      timer = window.setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(loading);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, delay]);

  // Si no está cargando, mostrar solo los children
  if (!showLoading) {
    return <>{children}</>;
  }

  // Modo skeleton
  if (type === 'skeleton') {
    return (
      <LoadingState
        type={type}
        variant={variant}
        progress={progress}
        message={message}
        description={description}
        size={size}
        color={color}
        showNetworkStatus={showNetworkStatus}
      />
    );
  }

  // Modo inline
  if (type === 'inline') {
    return (
      <Box sx={{ position: 'relative' }}>
        {children}
        <Fade in timeout={timeout}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingState
              type={type}
              variant={variant}
              progress={progress}
              message={message}
              description={description}
              size={size}
              color={color}
              showNetworkStatus={showNetworkStatus}
            />
          </Box>
        </Fade>
      </Box>
    );
  }

  // Modo overlay (default)
  return (
    <>
      {children}
      <Backdrop
        open={showLoading}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: backdrop ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        }}
      >
        <Fade in timeout={timeout}>
          <Card
            elevation={backdrop ? 8 : 0}
            sx={{
              backgroundColor: backdrop ? 'background.paper' : 'transparent',
              borderRadius: backdrop ? 2 : 0,
            }}
          >
            <CardContent>
              <LoadingState
                type={type}
                variant={variant}
                progress={progress}
                message={message}
                description={description}
                size={size}
                color={color}
                showNetworkStatus={showNetworkStatus}
              />
            </CardContent>
          </Card>
        </Fade>
      </Backdrop>
    </>
  );
};

// Componente de carga para listas
export const ListLoadingSkeleton: React.FC<{
  count?: number;
  showAvatar?: boolean;
}> = ({ count = 5, showAvatar = true }) => (
  <Stack spacing={1}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
        <Skeleton variant="rectangular" width={80} height={32} />
      </Box>
    ))}
  </Stack>
);

// Componente de carga para tablas
export const TableLoadingSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => (
  <Stack spacing={1}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} sx={{ display: 'flex', gap: 2, p: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="rectangular"
            height={48}
            sx={{ flex: 1 }}
          />
        ))}
      </Box>
    ))}
  </Stack>
);

export default LoadingOverlay;
