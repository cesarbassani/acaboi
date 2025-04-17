// src/services/authService.ts
import { supabase } from './supabase';

// Tipos de perfil disponíveis
export type UserRole = 'admin' | 'tecnico';

// Interface para dados do usuário autenticado
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  nome?: string;
}

// Interface para dados de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Obter usuário atual
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Buscar informações adicionais do usuário, incluindo o perfil
  const { data, error } = await supabase
    .from('usuarios')
    .select('role, nome')
    .eq('id_auth', user.id)
    .single();
  
  if (error || !data) {
    console.error('Erro ao buscar informações do usuário:', error);
    return null;
  }
  
  return {
    id: user.id,
    email: user.email || '',
    role: data.role as UserRole,
    nome: data.nome
  };
};

// Login de usuário
export const login = async ({ email, password }: LoginCredentials): Promise<AuthUser | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error('Erro no login:', error);
    throw error;
  }
  
  // Buscar informações adicionais do usuário após o login
  return getCurrentUser();
};

// Logout de usuário
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

// Verificar permissões (pode ser expandido conforme necessário)
export const checkPermission = async (
  requiredRole: UserRole | UserRole[] = ['admin']
): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // Converter para array se for uma string única
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Verificar se o usuário tem algum dos papéis requeridos
  return requiredRoles.includes(user.role);
};

// Verificar se o usuário atual tem permissão para gerenciar produtores e frigoríficos
export const canManageProducersAndSlaughterhouses = async (): Promise<boolean> => {
  // Tanto admin quanto técnico podem gerenciar produtores e frigoríficos
  return checkPermission(['admin', 'tecnico']);
};

// Verificar se o usuário atual tem permissão apenas para administradores
export const isAdmin = async (): Promise<boolean> => {
  return checkPermission(['admin']);
};