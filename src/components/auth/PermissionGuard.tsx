// src/components/auth/PermissionGuard.tsx - Versão corrigida
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import { hasPermission } from '../../types/auth';

interface PermissionGuardProps {
  requiredPermission: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ requiredPermission, children }) => {
  const { user } = useAuth();
  // Usar o campo role em vez de user_metadata.type
  const userRole = user?.role;
  
  console.log("User no PermissionGuard:", user);
  console.log("User role:", userRole);
  console.log("Required permission:", requiredPermission);
  console.log("Has permission:", hasPermission(userRole, requiredPermission));
  
  if (!hasPermission(userRole, requiredPermission)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Acesso Restrito
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Você não tem permissão para acessar esta funcionalidade.
        </Typography>
      </Box>
    );
  }
  
  return <>{children}</>;
};

export default PermissionGuard;