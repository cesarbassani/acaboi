// src/services/propriedadeService.ts
import { supabase } from './supabase';

export interface Propriedade {
  id: number;
  id_produtor: number;
  nome: string;
  telefone: string;
  celular: string;
  endereco: string;
  localizacao: string;
  cidade: string;
  inscricao_estadual: string;
  classificacao: string;
  created_at: string;
  updated_at: string;
  // Campos virtuais (relações)
  produtor?: {
    id: number;
    nome: string;
  };
}

export interface PropriedadeInput {
  id_produtor: number;
  nome: string;
  telefone?: string;
  celular?: string;
  endereco: string;
  localizacao?: string;
  cidade: string;
  inscricao_estadual?: string;
  classificacao?: string;
}

export const getPropriedades = async (): Promise<Propriedade[]> => {
  const { data, error } = await supabase
    .from('propriedades')
    .select(`
      *,
      produtor:produtores(id, nome)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar propriedades:', error);
    throw error;
  }

  return data || [];
};

// Em src/services/propriedadeService.ts, adicione ou atualize a função:
export const getPropriedadesByProdutor = async (produtorId: number): Promise<Propriedade[]> => {
  const { data, error } = await supabase
    .from('propriedades')
    .select(`
      *,
      produtor:produtores!fk_propriedades_produtor(id, nome)
    `)
    .eq('id_produtor', produtorId)
    .order('nome');

  if (error) {
    console.error(`Erro ao buscar propriedades do produtor ${produtorId}:`, error);
    throw error;
  }

  return data || [];
};


export const getPropriedade = async (id: number): Promise<Propriedade | null> => {
  const { data, error } = await supabase
    .from('propriedades')
    .select(`
      *,
      produtor:produtores!fk_propriedades_produtor(id, nome)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar propriedade ${id}:`, error);
    throw error;
  }

  return data;
};

export const createPropriedade = async (propriedade: PropriedadeInput): Promise<Propriedade> => {
  const { data, error } = await supabase
    .from('propriedades')
    .insert({
      ...propriedade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar propriedade:', error);
    throw error;
  }

  return data;
};

export const updatePropriedade = async (id: number, propriedade: Partial<PropriedadeInput>): Promise<Propriedade> => {
  const { data, error } = await supabase
    .from('propriedades')
    .update({
      ...propriedade,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar propriedade ${id}:`, error);
    throw error;
  }

  return data;
};

export const deletePropriedade = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('propriedades')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir propriedade ${id}:`, error);
    throw error;
  }
};

// Funções auxiliares para buscar produtores e técnicos para o formulário
export const getProdutoresSelect = async () => {
  const { data, error } = await supabase
    .from('produtores')
    .select(`
      id,
      nome
    `)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar produtores para select:', error);
    throw error;
  }

  return data || [];
};

export const getClassificacoes = () => {
  return [
    { value: 'A', label: 'A - Premium' },
    { value: 'B', label: 'B - Padrão' },
    { value: 'C', label: 'C - Básica' }
  ];
};