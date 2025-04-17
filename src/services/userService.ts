// src/services/userService.ts
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  type: 'admin' | 'tecnico';
  active: boolean;
  created_at?: string;
  last_sign_in_at?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }

  return users || [];
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    throw error;
  }

  return data;
};

export const createUser = async (email: string, password: string, userData: Partial<User>): Promise<User> => {
  // 1. Criar o usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirma e-mail automaticamente
    user_metadata: {
      name: userData.name,
      type: userData.type
    }
  });

  if (authError) {
    console.error('Erro ao criar usuário no Auth:', authError);
    throw authError;
  }

  // 2. Adicionar informações adicionais na tabela de usuários
  const user = {
    id: authData.user.id,
    email,
    name: userData.name,
    type: userData.type,
    active: true
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir usuário na tabela:', error);
    // Tentar remover o usuário Auth se falhar no banco
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }

  return data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  // 1. Atualizar metadados de Auth se necessário
  if (userData.name || userData.type) {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: {
        name: userData.name,
        type: userData.type
      }
    });

    if (authError) {
      console.error(`Erro ao atualizar metadados do usuário ${id}:`, authError);
      throw authError;
    }
  }

  // 2. Atualizar tabela de usuários
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    throw error;
  }

  return data;
};

export const toggleUserStatus = async (id: string, active: boolean): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao alterar status do usuário ${id}:`, error);
    throw error;
  }

  return data;
};

export const resetUserPassword = async (id: string, newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: newPassword
  });

  if (error) {
    console.error(`Erro ao redefinir senha do usuário ${id}:`, error);
    throw error;
  }
};