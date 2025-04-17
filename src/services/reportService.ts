// src/services/reportService.ts
import { supabase } from './supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Declaração para file-saver, que será disponibilizado globalmente
declare const saveAs: (blob: Blob, filename: string) => void;

// Interface para filtros de relatórios
export interface ReportFilters {
  dataInicio?: string;
  dataFim?: string;
  idProdutor?: number;
  idFrigorifico?: number;
  idCategoria?: number;
}

// Interface principal para os dados de abate
export interface Abate {
  id: number;
  data_abate: string;
  nome_lote: string;
  quantidade: number;
  valor_arroba_negociada: number;
  valor_total_acerto: number;
  trace: boolean;
  hilton: boolean;
  novilho_precoce: boolean;
  id_categoria_animal: number;
  id_produtor: number;
  id_frigorifico: number;
  // Relacionamentos - usamos tipos opcionais para evitar erros
  produtor?: {
    id: number;
    nome: string;
    propriedade?: { id: number; nome: string }[];
    // Removida referência a id_usuario
  };
  frigorifico?: {
    id: number;
    nome: string; // Alterado de responsavel para nome
  };
  categoriaAnimal?: {
    id: number;
    nome: string;
  };
}

// Interface para o resumo por produtor
export interface ResumoProdutorItem {
  id: number;
  nome: string; // Alterado de responsavel para nome
  propriedade: string;
  totalAbates: number;
  totalAnimais: number;
  valorTotal: number;
  mediaArroba: number;
  trace: number;
  hilton: number;
  novilhoPrecoce: number;
}

// Interface para o resumo por frigorífico
export interface ResumoFrigorificoItem {
  id: number;
  nome: string; // Alterado de responsavel para nome
  totalAbates: number;
  totalAnimais: number;
  valorTotal: number;
}

// Buscar dados de abate com filtros
export const getAbatesReport = async (filters: ReportFilters): Promise<Abate[]> => {
  let query = supabase.from('abates').select(`
    id,
    data_abate,
    nome_lote,
    quantidade,
    valor_arroba_negociada,
    valor_total_acerto,
    trace,
    hilton,
    novilho_precoce,
    id_categoria_animal,
    id_produtor,
    id_frigorifico,
    categoriaAnimal:id_categoria_animal(id, nome),
    produtor:id_produtor(id, nome, propriedade:id_propriedade(id, nome)),
    frigorifico:id_frigorifico(id, nome)
  `);

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
    console.error('Erro ao buscar dados para relatório:', error);
    throw error;
  }

  // Usando cast para garantir compatibilidade com a interface Abate
  return (data || []) as unknown as Abate[];
};

// Exportar para Excel
export const exportToExcel = (data: any[], filename: string): void => {
  // Transformar os dados para um formato flat
  const flattenedData = data.map(item => {
    const baseData: Record<string, any> = {
      'ID': item.id
    };

    // Adicionar campos diferentes com base no tipo de dados (abate, produtor ou frigorífico)
    if ('data_abate' in item) {
      // Formato de abate
      Object.assign(baseData, {
        'Data do Abate': new Date(item.data_abate).toLocaleDateString('pt-BR'),
        'Nome do Lote': item.nome_lote || '',
        'Quantidade': item.quantidade || 0,
        'Valor da Arroba': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_arroba_negociada || 0),
        'Valor Total': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total_acerto || 0),
        'Produtor': item.produtor?.nome || 'N/A',
        'Propriedade': item.produtor?.propriedades?.[0]?.nome || 'N/A',
        'Frigorífico': item.frigorifico?.nome || 'N/A', // Alterado de responsavel para nome
        'Categoria': item.categoriaAnimal?.nome || 'N/A',
        'TRACE': item.trace ? 'Sim' : 'Não',
        'HILTON': item.hilton ? 'Sim' : 'Não',
        'Novilho Precoce': item.novilho_precoce ? 'Sim' : 'Não'
      });
    } else if ('nome' in item && 'propriedade' in item) { // Alterado de responsavel para nome
      // Formato de produtor
      Object.assign(baseData, {
        'Nome': item.nome || '', // Alterado de Responsável para Nome
        'Propriedade': item.propriedade || '',
        'Total de Abates': item.totalAbates || 0,
        'Total de Animais': item.totalAnimais || 0,
        'Valor Total': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal || 0),
        'Média Arroba': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.mediaArroba || 0),
        'TRACE': item.trace || 0,
        'HILTON': item.hilton || 0,
        'Novilho Precoce': item.novilhoPrecoce || 0
      });
    } else if ('nome' in item && 'totalAbates' in item) { // Alterado de responsavel para nome
      // Formato de frigorífico
      Object.assign(baseData, {
        'Nome': item.nome || '', // Alterado de Responsável para Nome
        'Total de Abates': item.totalAbates || 0,
        'Total de Animais': item.totalAnimais || 0,
        'Valor Total': new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal || 0)
      });
    }

    return baseData;
  });

  // Criar uma worksheet
  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  
  // Criar workbook e adicionar a worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  
  // Ajustar largura das colunas automaticamente
  const columnsWidth = Object.keys(flattenedData[0] || {}).map(() => ({ wch: 20 }));
  worksheet['!cols'] = columnsWidth;
  
  // Exportar como arquivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Use a função saveAs global
  saveAs(blob, `${filename}.xlsx`);
};

// Exportar para PDF
export const exportToPDF = (data: any[], filename: string): void => {
  const doc = new jsPDF();
  
  // Adicionar título
  const title = filename.includes('abates') 
    ? 'Relatório de Abates' 
    : filename.includes('produtores') 
      ? 'Relatório de Produtores' 
      : 'Relatório de Frigoríficos';
  
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Adicionar data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);
  
  // Preparar dados para a tabela com base no tipo de dados
  let tableRows: any[][] = [];
  let tableHeader: string[] = [];
  
  if (data.length > 0) {
    if ('data_abate' in data[0]) {
      // Formato para abates
      tableHeader = ['ID', 'Data', 'Lote', 'Qtd', 'R$/Arroba', 'Total', 'Produtor', 'Frigorífico', 'Categoria'];
      
      tableRows = data.map(item => [
        item.id,
        new Date(item.data_abate).toLocaleDateString('pt-BR'),
        item.nome_lote || '',
        item.quantidade || 0,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_arroba_negociada || 0),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total_acerto || 0),
        item.produtor?.nome || 'N/A',
        item.frigorifico?.nome || 'N/A', // Alterado de responsavel para nome
        item.categoriaAnimal?.nome || 'N/A'
      ]);
    } else if ('nome' in data[0] && 'propriedade' in data[0]) { // Alterado de responsavel para nome
      // Formato para produtores
      tableHeader = ['ID', 'Nome', 'Propriedade', 'Total Abates', 'Total Animais', 'Valor Total', 'Média Arroba']; // Alterado de Responsável para Nome
      
      tableRows = data.map(item => [
        item.id,
        item.nome || '', // Alterado de responsavel para nome
        item.propriedade || '',
        item.totalAbates || 0,
        item.totalAnimais || 0,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal || 0),
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.mediaArroba || 0)
      ]);
    } else if ('nome' in data[0] && 'totalAbates' in data[0]) { // Alterado de responsavel para nome
      // Formato para frigoríficos
      tableHeader = ['ID', 'Nome', 'Total Abates', 'Total Animais', 'Valor Total']; // Alterado de Responsável para Nome
      
      tableRows = data.map(item => [
        item.id,
        item.nome || '', // Alterado de responsavel para nome
        item.totalAbates || 0,
        item.totalAnimais || 0,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal || 0)
      ]);
    }
  }
  
  // Adicionar tabela ao PDF usando jspdf-autotable
  (doc as any).autoTable({
    head: [tableHeader],
    body: tableRows,
    startY: 25,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [166, 206, 57], textColor: [0, 0, 0] },
    // Definir largura automática das colunas
    columnStyles: tableHeader.reduce((acc, _, index) => {
      acc[index] = { cellWidth: 'auto' };
      return acc;
    }, {} as Record<string, { cellWidth: string }>)
  });
  
  // Salvar o PDF
  doc.save(`${filename}.pdf`);
};

// Obter resumo por produtor
export const getResumoPorProdutor = async (filters: ReportFilters): Promise<ResumoProdutorItem[]> => {
  const abates = await getAbatesReport(filters);
  
  // Agrupar por produtor
  const porProdutor = new Map<number, ResumoProdutorItem>();
  
  abates.forEach(abate => {
    if (abate.produtor?.id) {
      const produtorId = abate.produtor.id;
      const atual = porProdutor.get(produtorId) || {
        id: produtorId,
        nome: abate.produtor.nome || 'N/A', // Mantido como nome
        propriedade: abate.produtor?.propriedade?.[0]?.nome || 'N/A',
        totalAbates: 0,
        totalAnimais: 0,
        valorTotal: 0,
        mediaArroba: 0,
        trace: 0,
        hilton: 0,
        novilhoPrecoce: 0
      };
      
      porProdutor.set(produtorId, {
        ...atual,
        totalAbates: atual.totalAbates + 1,
        totalAnimais: atual.totalAnimais + (abate.quantidade || 0),
        valorTotal: atual.valorTotal + (abate.valor_total_acerto || 0),
        mediaArroba: 0, // Será calculado depois
        trace: atual.trace + (abate.trace ? 1 : 0),
        hilton: atual.hilton + (abate.hilton ? 1 : 0),
        novilhoPrecoce: atual.novilhoPrecoce + (abate.novilho_precoce ? 1 : 0)
      });
    }
  });
  
  // Calcular média da arroba
  const resumo = Array.from(porProdutor.values()).map(prod => {
    return {
      ...prod,
      mediaArroba: prod.totalAnimais > 0 ? prod.valorTotal / (prod.totalAnimais * 15) : 0 // Estimativa de 15 arrobas por animal
    };
  });
  
  return resumo;
};

// Obter resumo por frigorifico
export const getResumoPorFrigorifico = async (filters: ReportFilters): Promise<ResumoFrigorificoItem[]> => {
  const abates = await getAbatesReport(filters);
  
  // Agrupar por frigorifico
  const porFrigorifico = new Map<number, ResumoFrigorificoItem>();
  
  abates.forEach(abate => {
    if (abate.frigorifico?.id) {
      const frigorificoId = abate.frigorifico.id;
      const atual = porFrigorifico.get(frigorificoId) || {
        id: frigorificoId,
        nome: abate.frigorifico.nome || 'N/A', // Alterado de responsavel para nome
        totalAbates: 0,
        totalAnimais: 0,
        valorTotal: 0
      };
      
      porFrigorifico.set(frigorificoId, {
        ...atual,
        totalAbates: atual.totalAbates + 1,
        totalAnimais: atual.totalAnimais + (abate.quantidade || 0),
        valorTotal: atual.valorTotal + (abate.valor_total_acerto || 0)
      });
    }
  });
  
  return Array.from(porFrigorifico.values());
};