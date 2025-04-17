// src/services/categoriaService.ts
import { supabase } from './supabase';

export interface Categoria {
  id: number;
  nome: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Busca todas as categorias de animais
 * @returns Array de categorias
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase
    .from('categoria_animais')
    .select('id, nome')
    .order('nome', { ascending: true });
    
  if (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Busca uma categoria específica pelo ID
 * @param id ID da categoria
 * @returns Dados da categoria
 */
export const getCategoriaById = async (id: number): Promise<Categoria | null> => {
  const { data, error } = await supabase
    .from('categoria_animais')
    .select('id, nome')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Erro ao buscar categoria ${id}:`, error);
    throw error;
  }
  
  return data;
};

/**
 * Cria uma nova categoria de animal
 * @param categoria Dados da categoria a ser criada
 * @returns Categoria criada
 */
export const createCategoria = async (categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> => {
  const { data, error } = await supabase
    .from('categoria_animais')
    .insert(categoria)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
  
  return data;
};

/**
 * Atualiza uma categoria existente
 * @param id ID da categoria
 * @param categoria Dados atualizados
 * @returns Categoria atualizada
 */
export const updateCategoria = async (id: number, categoria: Partial<Omit<Categoria, 'id' | 'created_at' | 'updated_at'>>): Promise<Categoria> => {
  const { data, error } = await supabase
    .from('categoria_animais')
    .update(categoria)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Erro ao atualizar categoria ${id}:`, error);
    throw error;
  }
  
  return data;
};

/**
 * Remove uma categoria
 * @param id ID da categoria a ser removida
 * @returns Sucesso ou falha
 */
export const deleteCategoria = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('categoria_animais')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Erro ao excluir categoria ${id}:`, error);
    throw error;
  }
  
  return true;
};