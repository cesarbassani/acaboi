// src/services/abateService.ts
import { supabase } from './supabase';

export interface Abate {
  id: number;
  id_produtor: number;
  id_frigorifico: number;
  id_categoria_animal: number;
  id_propriedade: number;
  nome_lote: string;
  data_abate: string;
  quantidade: number;
  valor_arroba_negociada: number;
  valor_arroba_prazo_ou_vista: number;
  trace: boolean;
  hilton: boolean;
  desconto: number;
  novilho_precoce: boolean;
  dias_cocho: number;
  reembolso: number;
  carcacas_avaliadas: number;
  valor_total_acerto: number;
  observacao: string;
  created_at: string;
  updated_at: string;
  // Campos virtuais (relações)
  produtor?: {
    id: number;
    nome: string;
    usuario?: {
      name: string;
    };
  };
  frigorifico?: {
    id: number;
    nome: string;
    usuario?: {
      name: string;
    };
  };
  categoriaAnimal?: {
    id: number;
    nome: string;
  };
  propriedade?: {
    id: number;
    nome: string;
  };
}

export interface AbateInput {
  id_produtor: number;
  id_frigorifico: number;
  id_categoria_animal: number;
  id_propriedade: number;
  nome_lote: string;
  data_abate: string;
  quantidade: number;
  valor_arroba_negociada: number;
  valor_arroba_prazo_ou_vista: number;
  trace: boolean;
  hilton: boolean;
  desconto: number;
  novilho_precoce: boolean;
  dias_cocho: number;
  reembolso: number;
  carcacas_avaliadas: number;
  valor_total_acerto: number;
  observacao?: string;
}

export const getAbates = async (): Promise<Abate[]> => {
  const { data, error } = await supabase
    .from('abates')
    .select(`
      *,
      produtor:id_produtor(id, nome),
      frigorifico:id_frigorifico(id, nome),
      categoriaAnimal:id_categoria_animal(id, nome),
      propriedade:id_propriedade(id, nome)
    `)
    .order('data_abate', { ascending: false });

  if (error) {
    console.error('Erro ao buscar abates:', error);
    throw error;
  }

  return data || [];
};

export const getAbatesByProdutor = async (produtorId: number): Promise<Abate[]> => {
  const { data, error } = await supabase
    .from('abates')
    .select(`
      *,
      produtor:id_produtor(id, nome),
      frigorifico:id_frigorifico(id, nome),
      categoriaAnimal:id_categoria_animal(id, nome),
      propriedade:id_propriedade(id, nome)
    `)
    .eq('id_produtor', produtorId)
    .order('data_abate', { ascending: false });

  if (error) {
    console.error(`Erro ao buscar abates do produtor ${produtorId}:`, error);
    throw error;
  }

  return data || [];
};

export const getAbatesByFrigorifico = async (frigorificoId: number): Promise<Abate[]> => {
  const { data, error } = await supabase
    .from('abates')
    .select(`
      *,
      produtor:id_produtor(id, nome),
      frigorifico:id_frigorifico(id, nome),
      categoriaAnimal:id_categoria_animal(id, nome),
      propriedade:id_propriedade(id, nome)
    `)
    .eq('id_frigorifico', frigorificoId)
    .order('data_abate', { ascending: false });

  if (error) {
    console.error(`Erro ao buscar abates do frigorífico ${frigorificoId}:`, error);
    throw error;
  }

  return data || [];
};

export const getAbate = async (id: number): Promise<Abate | null> => {
  const { data, error } = await supabase
    .from('abates')
    .select(`
      *,
      produtor:id_produtor(id, nome),
      frigorifico:id_frigorifico(id, nome),
      categoriaAnimal:id_categoria_animal(id, nome),
      propriedade:id_propriedade(id, nome)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar abate ${id}:`, error);
    throw error;
  }

  return data;
};

export const createAbate = async (abate: AbateInput): Promise<Abate> => {
  const { data, error } = await supabase
    .from('abates')
    .insert({
      ...abate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar abate:', error);
    throw error;
  }

  return data;
};

export const updateAbate = async (id: number, abate: Partial<AbateInput>): Promise<Abate> => {
  const { data, error } = await supabase
    .from('abates')
    .update({
      ...abate,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar abate ${id}:`, error);
    throw error;
  }

  return data;
};

export const deleteAbate = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('abates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir abate ${id}:`, error);
    throw error;
  }
};

// Funções auxiliares para obter dados para os selects
export const getProdutoresSelect = async () => {
  const { data, error } = await supabase
    .from('produtores')
    .select(`
      id,
      nome,
    `)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar produtores para select:', error);
    throw error;
  }

  return data || [];
};

export const getFrigorificosSelect = async () => {
  const { data, error } = await supabase
    .from('frigorificos')
    .select(`
      id,
      nome,
    `)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar frigoríficos para select:', error);
    throw error;
  }

  return data || [];
};

export const getCategoriasSelect = async () => {
  const { data, error } = await supabase
    .from('categoria_animais')
    .select(`
      id,
      nome
    `)
    .order('nome');

  if (error) {
    console.error('Erro ao buscar categorias para select:', error);
    throw error;
  }

  return data || [];
};

export const getPropriedadesByProdutor = async (produtorId: number) => {
  const { data, error } = await supabase
    .from('propriedades')
    .select(`
      id,
      nome
    `)
    .eq('id_produtor', produtorId)
    .order('nome');

  if (error) {
    console.error(`Erro ao buscar propriedades do produtor ${produtorId}:`, error);
    throw error;
  }

  return data || [];
};