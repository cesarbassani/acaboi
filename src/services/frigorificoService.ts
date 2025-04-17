// src/services/frigorificoService.ts
import { supabase } from './supabase';

export interface Frigorifico {
  id: number;
  nome: string; // Alterado de responsavel para nome
  endereco: string;
  cidade: string;
  cnpj: string;
  created_at?: string;
  updated_at?: string;
  email?: string;
  // Removida referência a id_usuario e usuario
}

export interface FrigorificoInput {
  nome: string; // Alterado de responsavel para nome
  endereco: string;
  cidade: string;
  cnpj: string;
  email?: string;
  // Removida referência a id_usuario
}

export const getFrigorificos = async (): Promise<Frigorifico[]> => {
  const { data, error } = await supabase
    .from('frigorificos')
    .select('*') // Removida a referência a usuario:id_usuario
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar frigoríficos:', error);
    throw error;
  }

  return data || [];
};

export const getFrigorifico = async (id: number): Promise<Frigorifico | null> => {
  const { data, error } = await supabase
    .from('frigorificos')
    .select('*') // Removida a referência a usuario:id_usuario
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar frigorífico ${id}:`, error);
    throw error;
  }

  return data;
};

export const createFrigorifico = async (data: FrigorificoInput): Promise<Frigorifico> => {
  const { data: result, error } = await supabase
    .from('frigorificos')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar frigorífico:', error);
    throw error;
  }

  return result;
};

export const updateFrigorifico = async (id: number, frigorifico: FrigorificoInput): Promise<Frigorifico> => {
  const { data, error } = await supabase
    .from('frigorificos')
    .update(frigorifico)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar frigorífico ${id}:`, error);
    throw error;
  }

  return data;
};

export const deleteFrigorifico = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('frigorificos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir frigorífico ${id}:`, error);
    throw error;
  }
};

// Método auxiliar para verificar se um CNPJ já está em uso
export const isCnpjUnique = async (cnpj: string, excludeId?: number): Promise<boolean> => {
  let query = supabase
    .from('frigorificos')
    .select('id')
    .eq('cnpj', cnpj);
    
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao verificar CNPJ:', error);
    throw error;
  }
  
  return (data?.length || 0) === 0;
};
