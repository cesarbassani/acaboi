import { supabase } from './supabase';

export interface Escala {
  id: number;
  tipo_servico: string;
  data_embarque: string;
  data_abate: string;
  id_frigorifico: number;
  frigorifico?: { id: number; nome: string };
  quantidade: number;
  categoria: string;
  id_produtor: number;
  produtor?: { id: number; nome: string };
  id_propriedade: number;
  propriedade?: { id: number; nome: string; cidade: string };
  municipio: string;
  id_protocolo: number | null;
  protocolo?: { id: number; nome: string } | null;
  preco_arroba: number | null;
  preco_cabeca: number | null;
  tipo_negociacao: string;
  forma_pagamento: string;
  id_tecnico_negociador: number | null;
  tecnico_negociador?: { id: number; empresa: string; usuario?: { name: string } } | null;
  id_tecnico_responsavel: number | null;
  tecnico_responsavel?: { id: number; empresa: string; usuario?: { name: string } } | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscalaInput {
  tipo_servico: string;
  data_embarque: string;
  data_abate: string;
  id_frigorifico: number;
  quantidade: number;
  categoria: string;
  id_produtor: number;
  id_propriedade: number;
  municipio: string;
  id_protocolo: number | null;
  preco_arroba: number | null;
  preco_cabeca: number | null;
  tipo_negociacao: string;
  forma_pagamento: string;
  id_tecnico_negociador: number | null;
  id_tecnico_responsavel: number | null;
  observacoes: string | null;
}

// Em escalaService.ts, modifique a função getEscalaAbates para:

export const getEscalaAbates = async (): Promise<Escala[]> => {
  const { data, error } = await supabase
    .from('escala_abates')
    .select(`
      *,
      frigorifico:frigorificos!fk_escala_abates_frigorifico(id, nome),
      produtor:produtores!fk_escala_abates_produtor(id, nome),
      propriedade:propriedades!fk_escala_abates_propriedade(id, nome, cidade),
      protocolo:id_protocolo(id, nome),
      tecnico_negociador:id_tecnico_negociador(id, empresa, usuario:id_usuario(name)),
      tecnico_responsavel:id_tecnico_responsavel(id, empresa, usuario:id_usuario(name))
    `)
    .order('data_abate', { ascending: false });

  if (error) {
    console.error('Erro ao buscar escala de abates:', error);
    throw error;
  }

  return data || [];
};

export const getEscalaAbate = async (id: number): Promise<Escala | null> => {
  const { data, error } = await supabase
    .from('escala_abates')
    .select(`
      *,
      frigorifico:frigorificos!fk_escala_abates_frigorifico(id, nome),
      produtor:produtores!fk_escala_abates_produtor(id, nome),
      propriedade:propriedades!fk_escala_abates_propriedade(id, nome, cidade),
      protocolo:id_protocolo(id, nome),
      tecnico_negociador:id_tecnico_negociador(id, empresa, usuario:id_usuario(name)),
      tecnico_responsavel:id_tecnico_responsavel(id, empresa, usuario:id_usuario(name))
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erro ao buscar escala de abate ${id}:`, error);
    throw error;
  }

  return data;
};

export const createEscalaAbate = async (escalaData: EscalaInput): Promise<Escala> => {
  const { data, error } = await supabase
    .from('escala_abates')
    .insert(escalaData)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar escala de abate:', error);
    throw error;
  }

  return data;
};

export const updateEscalaAbate = async (id: number, escalaData: EscalaInput): Promise<Escala> => {
  const { data, error } = await supabase
    .from('escala_abates')
    .update(escalaData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erro ao atualizar escala de abate ${id}:`, error);
    throw error;
  }

  return data;
};

export const deleteEscalaAbate = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('escala_abates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erro ao excluir escala de abate ${id}:`, error);
    throw error;
  }
};

// Serviços auxiliares para os selects
export const getFrigorificosSelect = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('frigorificos')
    .select('id, nome')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar frigoríficos:', error);
    throw error;
  }

  return data || [];
};

export const getProtocolosSelect = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('protocolos')
    .select('id, nome')
    .order('nome');

  if (error) {
    console.error('Erro ao buscar protocolos:', error);
    throw error;
  }

  return data || [];
};

// Obter técnicos usando a função já existente no sistema
export const getTecnicos = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('tecnicos')
    .select(`
      id,
      empresa,
      usuario:id_usuario(id, name)
    `)
    .order('empresa');

  if (error) {
    console.error('Erro ao buscar técnicos:', error);
    throw error;
  }

  return data || [];
};

export const getTiposServico = () => [
  { value: 'ABATE', label: 'Acompanhamento de abate' },
  { value: 'CERTIFICAÇÃO', label: 'Certificação' },
  { value: 'DESOSSA', label: 'Desossa' },
  { value: 'VISITA TÉCNICA', label: 'Visita Técnica' },
];

export const getCategoriasAnimais = () => [
  { value: 'MC', label: 'MC' },
  { value: 'MI', label: 'MI' },
  { value: 'IM', label: 'IM' },
  { value: 'F', label: 'F' },
];

export const getTiposNegociacao = () => [
  { value: 'DIRETO PRODUTOR', label: 'Direto com o produtor' },
  { value: 'PECBR', label: 'PecBR' },
];

export const getFormasPagamento = () => [
  { value: 'À vista', label: 'À Vista' },
  { value: '07 dias', label: '7 Dias' },
  { value: '15 dias', label: '15 Dias' },
  { value: '30 dias', label: '30 Dias' },
];