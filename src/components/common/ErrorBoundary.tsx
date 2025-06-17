import React, { Component, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Container,
  Divider,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Check if we're in development mode
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Follows modern React patterns and provides user-friendly error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });    // Log error to console in development
    if (isDevelopment) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRefresh = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <BugReportIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'error.main',
                    mb: 2
                  }} 
                />
                <Typography variant="h4" component="h1" gutterBottom>
                  ¡Oops! Algo salió mal
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Ha ocurrido un error inesperado en la aplicación. 
                  Puedes intentar recargar la página o regresar al inicio.
                </Typography>
              </Box>

              <Alert severity="error" sx={{ width: '100%' }}>
                <AlertTitle>Error Técnico</AlertTitle>
                {this.state.error?.message || 'Error desconocido'}
              </Alert>

              {/* Error details for development */}
              {isDevelopment && this.state.errorInfo && (
                <Box sx={{ width: '100%' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Detalles del Error (Desarrollo)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      maxHeight: 200
                    }}
                  >
                    {this.state.error?.stack}
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      maxHeight: 200,
                      mt: 1
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Box>
                </Box>
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRefresh}
                  size="large"
                >
                  Intentar de nuevo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  size="large"
                >
                  Ir al inicio
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of Error Boundary for functional components
 * Note: This doesn't actually catch errors, it's just a utility for error state management
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Handled error:', error);
  }, []);

  return {
    error,
    hasError: !!error,
    resetError,
    handleError
  };
};

/**
 * Higher-order component that wraps a component with an Error Boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
