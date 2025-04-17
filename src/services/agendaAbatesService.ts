import { supabase } from './supabase';

export interface AgendaAbate {
  id: number;
  tipo_servico: string;
  data_embarque: string;
  data_abate: string;
  quantidade: number;
  categoria: string;
  municipio: string;
  preco_arroba: number | null;
  preco_cabeca: number | null;
  tipo_negociacao: string;
  forma_pagamento: string;
  observacoes: string | null;
  id_frigorifico: number;
  frigorifico_nome: string;
  id_produtor: number;
  produtor_nome: string;
  id_propriedade: number;
  propriedade_nome: string;
  id_tecnico_negociador: number | null;
  tecnico_negociador_empresa: string | null;
  tecnico_negociador_nome: string | null;
  id_tecnico_responsavel: number | null;
  tecnico_responsavel_empresa: string | null;
  tecnico_responsavel_nome: string | null;
  semana: number;
  ano: number;
  dia_semana: string;
}

export interface AgendaFilter {
  semana?: number;
  ano?: number;
  dia_semana?: string[];
  id_tecnico?: number;
  id_frigorifico?: number;
  id_produtor?: number;
}

export const getAgendaAbates = async (filtros?: AgendaFilter): Promise<AgendaAbate[]> => {
  let query = supabase
    .from('view_agenda_abates')
    .select('*');

  // Aplicar filtros se existirem
  if (filtros) {
    if (filtros.semana) {
      query = query.eq('semana', filtros.semana);
    }
    
    if (filtros.ano) {
      query = query.eq('ano', filtros.ano);
    }
    
    if (filtros.dia_semana && filtros.dia_semana.length > 0) {
      query = query.in('dia_semana', filtros.dia_semana);
    }
    
    if (filtros.id_tecnico) {
      query = query.or(`id_tecnico_negociador.eq.${filtros.id_tecnico},id_tecnico_responsavel.eq.${filtros.id_tecnico}`);
    }
    
    if (filtros.id_frigorifico) {
      query = query.eq('id_frigorifico', filtros.id_frigorifico);
    }
    
    if (filtros.id_produtor) {
      query = query.eq('id_produtor', filtros.id_produtor);
    }
  }

  // Ordenar por data de abate
  query = query.order('data_abate');

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar agenda de abates:', error);
    throw error;
  }

  return data || [];
};

export const getCurrentWeekNumber = (): number => {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getWeeksInYear = (year: number): number[] => {
  // A maioria dos anos tem 52 semanas, alguns têm 53
  const lastDay = new Date(year, 11, 31);
  const lastWeek = Math.ceil((lastDay.getTime() - new Date(year, 0, 1).getTime()) / 86400000 / 7);
  
  return Array.from({ length: lastWeek }, (_, i) => i + 1);
};

export const getDaysOfWeek = (): { value: string, label: string }[] => {
  return [
    { value: 'Monday', label: 'Segunda-feira' },
    { value: 'Tuesday', label: 'Terça-feira' },
    { value: 'Wednesday', label: 'Quarta-feira' },
    { value: 'Thursday', label: 'Quinta-feira' },
    { value: 'Friday', label: 'Sexta-feira' },
    { value: 'Saturday', label: 'Sábado' }
  ];
};

export const getDateRangeForWeek = (weekNumber: number, year: number): { start: Date, end: Date } => {
  // Implementação mais precisa para calcular a semana correta
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOffset = firstDayOfYear.getDay() === 0 ? 6 : firstDayOfYear.getDay() - 1; // Ajustar para iniciar em segunda-feira
  
  const firstDayOfWeek = new Date(year, 0, 1 + (weekNumber - 1) * 7 - dayOffset);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 5); // +5 para incluir até sábado
  
  return { start: firstDayOfWeek, end: lastDayOfWeek };
};

// Cores para cada técnico
const technicianColors: Record<string, string> = {
  'CAIKI': '#4a6da7', // Azul
  'GABRIELA': '#a72a31', // Vermelho
  'LUANA': '#a72a31', // Vermelho (mesmo da Gabriela)
  'JOÃO PEDRO': '#4d9652', // Verde
  'default': '#f39c12' // Laranja (cor padrão)
};

export const getTechnicianColor = (technicianName: string | null): string => {
  if (!technicianName) return technicianColors.default;
  
  // Procurar pelo nome do técnico nas chaves do objeto de cores
  const matchingKey = Object.keys(technicianColors).find(
    key => technicianName.toUpperCase().includes(key)
  );
  
  return matchingKey ? technicianColors[matchingKey] : technicianColors.default;
};