// src/services/dashboardService.ts
import { supabase } from './supabase';

// Interface para o resumo do dashboard
export interface DashboardSummary {
  totalAbates: number;
  totalAnimais: number;
  valorTotalAcerto: number;
  mediaArrobaNegociada: number;
  abatesPorCategoria: { categoria: string; quantidade: number }[];
  abatesPorMes: { mes: string; quantidade: number; valor: number }[];
  bonificacoes: {
    trace: number;
    hilton: number;
    novilhoPrecoce: number;
  };
}

// Obter resumo do dashboard com base no tipo de usuário e ID
export const getDashboardSummary = async (
  userType: string,
  userId?: string,
  filters?: {
    dataInicio?: string;
    dataFim?: string;
    idProdutor?: number;
    idFrigorifico?: number;
    idCategoria?: number;
  }
): Promise<DashboardSummary> => {
  // Primeiro, precisamos encontrar os IDs numéricos corretos com base no ID do usuário
  let produtorId: number | null = null;
  let frigorificoId: number | null = null;
  let tecnicoId: number | null = null;

  if (userId) {
    if (userType === 'produtor') {
      // Buscar o ID numérico do produtor associado a este usuário
      const { data: produtorData } = await supabase
        .from('produtores')
        .select('id')
        .single();
      
      if (produtorData) {
        produtorId = produtorData.id;
      }
    } else if (userType === 'frigorifico') {
      // Buscar o ID numérico do frigorífico associado a este usuário
      const { data: frigorificoData } = await supabase
        .from('frigorificos')
        .select('id')
        .single();
      
      if (frigorificoData) {
        frigorificoId = frigorificoData.id;
      }
    } else if (userType === 'tecnico') {
      // Buscar o ID numérico do técnico associado a este usuário
      const { data: tecnicoData } = await supabase
        .from('tecnicos')
        .select('id')
        .eq('id_usuario', userId)
        .single();
      
      if (tecnicoData) {
        tecnicoId = tecnicoData.id;
      }
    }
  }

  // Agora fazemos a consulta principal
  let query = supabase.from('abates').select(`
    id,
    data_abate,
    quantidade,
    valor_arroba_negociada,
    valor_total_acerto,
    trace,
    hilton,
    novilho_precoce,
    id_categoria_animal,
    categoriaAnimal:id_categoria_animal(id, nome),
    produtor:id_produtor(id, nome),
    frigorifico:id_frigorifico(id, nome),
    propriedade:id_propriedade(id, nome)
  `);

  // Aplicar filtros baseados no tipo de usuário e IDs resolvidos
  if (produtorId) {
    query = query.eq('id_produtor', produtorId);
  } else if (frigorificoId) {
    query = query.eq('id_frigorifico', frigorificoId);
  } else if (tecnicoId) {
    // Aqui precisamos fazer uma abordagem diferente para técnicos
    // Primeiro obtemos as propriedades que o técnico gerencia
    const { data: propriedadesData } = await supabase
      .from('propriedades')
      .select('id')
      .eq('id_tecnico', tecnicoId);
    
    if (propriedadesData && propriedadesData.length > 0) {
      const propriedadeIds = propriedadesData.map(p => p.id);
      // Agora filtramos abates por propriedades
      query = query.in('id_propriedade', propriedadeIds);
    }
  }

  // Aplicar filtros adicionais
  if (filters?.dataInicio) {
    query = query.gte('data_abate', filters.dataInicio);
  }
  if (filters?.dataFim) {
    query = query.lte('data_abate', filters.dataFim);
  }
  if (filters?.idProdutor) {
    query = query.eq('id_produtor', filters.idProdutor);
  }
  if (filters?.idFrigorifico) {
    query = query.eq('id_frigorifico', filters.idFrigorifico);
  }
  if (filters?.idCategoria) {
    query = query.eq('id_categoria_animal', filters.idCategoria);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }

  // Também vamos buscar informações das categorias para garantir que temos os nomes corretos
  const { data: categorias, error: categoriasError } = await supabase
    .from('categoria_animais')
    .select('id, nome');

  if (categoriasError) {
    console.error('Erro ao buscar categorias:', categoriasError);
    throw categoriasError;
  }

  // Mapa de ID para nome de categoria
  const categoriasMap = new Map<number, string>();
  categorias.forEach((cat) => {
    categoriasMap.set(cat.id, cat.nome);
  });

  // Processar os dados para o resumo
  const totalAbates = data.length;
  const totalAnimais = data.reduce((sum, abate) => sum + abate.quantidade, 0);
  const valorTotalAcerto = data.reduce((sum, abate) => sum + abate.valor_total_acerto, 0);
  
  const totalArrobas = data.reduce(
    (sum, abate) => sum + abate.quantidade * abate.valor_arroba_negociada, 
    0
  );
  const mediaArrobaNegociada = totalArrobas / totalAnimais || 0;

  // Agregação por categoria animal
  const categoriaQuantidades = new Map<string, number>();
  data.forEach((abate) => {
    // Obter o nome da categoria do mapa que criamos acima
    const categoriaId = abate.id_categoria_animal;
    const categoriaNome = categoriasMap.get(categoriaId) || 'Não definida';
    const quantidade = abate.quantidade || 0;
    
    categoriaQuantidades.set(
      categoriaNome, 
      (categoriaQuantidades.get(categoriaNome) || 0) + quantidade
    );
  });

  const abatesPorCategoria = Array.from(categoriaQuantidades).map(([categoria, quantidade]) => ({
    categoria,
    quantidade,
  }));

  // Agregação por mês
  const mesesMap = new Map<string, { quantidade: number; valor: number }>();
  data.forEach((abate) => {
    const mes = abate.data_abate.substring(0, 7); // Formato: YYYY-MM
    const quantidade = abate.quantidade || 0;
    const valor = abate.valor_total_acerto || 0;
    
    const atual = mesesMap.get(mes) || { quantidade: 0, valor: 0 };
    mesesMap.set(mes, {
      quantidade: atual.quantidade + quantidade,
      valor: atual.valor + valor,
    });
  });

  const abatesPorMes = Array.from(mesesMap).map(([mes, { quantidade, valor }]) => ({
    mes,
    quantidade,
    valor,
  })).sort((a, b) => a.mes.localeCompare(b.mes));

  // Contagem de bonificações
  const bonificacoes = {
    trace: data.filter(abate => abate.trace).length,
    hilton: data.filter(abate => abate.hilton).length,
    novilhoPrecoce: data.filter(abate => abate.novilho_precoce).length,
  };

  return {
    totalAbates,
    totalAnimais,
    valorTotalAcerto,
    mediaArrobaNegociada,
    abatesPorCategoria,
    abatesPorMes,
    bonificacoes,
  };
};

// Função para obter dados mais recentes para o feed de atividades
export const getRecentActivities = async (limit = 5) => {
  const { data, error } = await supabase
    .from('abates')
    .select(`
      id,
      data_abate,
      nome_lote,
      quantidade,
      valor_total_acerto,
      created_at,
      produtor:id_produtor(id, nome),
      frigorifico:id_frigorifico(id, nome)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    throw error;
  }

  return data;
};