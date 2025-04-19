// src/types/auth.ts
export type UserRole = 'admin' | 'tecnico';

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  tecnico: 'Técnico'
};

export const userRolePermissions: Record<UserRole, string[]> = {
  admin: ['all'], // Admin tem acesso completo
  tecnico: [
    // 'dashboard', 
    'escala',
    'agenda',
    // 'abates', 
    // 'importar', 
    // 'relatorios'
  ]
};

// Função para verificar permissões
export const hasPermission = (userRole: string | undefined, requiredPermission: string): boolean => {
  if (!userRole) return false;
  
  // Admin tem acesso a tudo
  if (userRole === 'admin') return true;
  
  // Verificar permissões específicas para outros tipos
  return userRolePermissions[userRole as UserRole]?.includes(requiredPermission) || 
         userRolePermissions[userRole as UserRole]?.includes('all') || 
         false;
};