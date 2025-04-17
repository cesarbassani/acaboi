// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { checkPermission, UserRole } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = ['admin'] // Por padrão, apenas admin
}) => {
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyPermission = async () => {
      try {
        const permitted = await checkPermission(requiredRoles);
        setHasPermission(permitted);
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPermission();
  }, [requiredRoles]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando permissões...
        </Typography>
      </Box>
    );
  }

  if (!hasPermission) {
    // Redirecionar para a página de login se não tiver permissão
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;