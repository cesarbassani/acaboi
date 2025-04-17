// src/services/produtorService.ts
import { supabase } from './supabase';

export interface Produtor {
  id: number;
  nome: string; // Alterado de responsavel para nome
  endereco: string;
  cidade: string;
  cnpj: string;
  marca_produtor: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ProdutorInput {
  nome: string; // Alterado de responsavel para nome
  endereco: string;
  cidade: string;
  cnpj: string;
  marca_produtor: string;
  email: string;
}

export const getProdutores = async (): Promise<Produtor[]> => {
  const { data, error } = await supabase
    .from('produtores')
    .select('*') // Removida a referência a usuario:id_usuario
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtores:', error);
    throw error;
  }

  return data || [];
};

export const getProdutor = async (id: number): Promise<Produtor | null> => {
  const { data, error } = await supabase
    .from('produtores')
    .select('*') // Removida a referência a usuario:id_usuario
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar produtor ${id}:`, error);
    throw error;
  }

  return data;
};

export const createProdutor = async (produtor: ProdutorInput): Promise<Produtor> => {
  const { data, error } = await supabase
    .from('produtores')
    .insert(produtor)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar produtor:', error);
    throw error;
  }

  return data;
};

export const updateProdutor = async (id: number, produtor: ProdutorInput): Promise<Produtor> => {
  const { data, error } = await supabase
    .from('produtores')
    .update(produtor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar produtor ${id}:`, error);
    throw error;
  }

  return data;
};

export const deleteProdutor = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('produtores')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir produtor ${id}:`, error);
    throw error;
  }
};

// Método auxiliar para verificar se um CNPJ já está em uso
export const isCnpjUnique = async (cnpj: string, excludeId?: number): Promise<boolean> => {
  let query = supabase
    .from('produtores')
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
