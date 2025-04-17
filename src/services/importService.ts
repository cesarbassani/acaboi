// src/services/importService.ts
import { supabase } from './supabase';
import * as XLSX from 'xlsx';

// Interface para representar dados de abate na importação
export interface ImportAbateData {
  data_abate: string;
  nome_lote: string;
  quantidade: number;
  valor_arroba_negociada: number;
  valor_total_acerto: number;
  id_produtor: number;
  id_frigorifico: number;
  id_categoria_animal: number;
  trace: boolean;
  hilton: boolean;
  novilho_precoce: boolean;
  [key: string]: any; // Para campos adicionais
}

export interface ColumnMapping {
  sheetColumn: string;
  dbField: keyof ImportAbateData;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// Função para ler arquivo Excel/CSV
export const readFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Função para processar dados com base no mapeamento de colunas
export const processData = (rows: any[], columnMapping: ColumnMapping[]): ImportAbateData[] => {
  const headers = rows[0];
  const data = rows.slice(1);
  
  return data.map(row => {
    const item: Partial<ImportAbateData> = {};
    
    columnMapping.forEach(mapping => {
      const columnIndex = headers.indexOf(mapping.sheetColumn);
      if (columnIndex !== -1) {
        let value = row[columnIndex];
        
        // Conversões de tipo baseadas no campo de destino
        switch (mapping.dbField) {
          case 'data_abate':
            // Se for um número (Excel armazena datas como números), converte para data
            if (typeof value === 'number') {
              const date = XLSX.SSF.parse_date_code(value);
              value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
            }
            break;
          case 'quantidade':
          case 'valor_arroba_negociada':
          case 'valor_total_acerto':
          case 'id_produtor':
          case 'id_frigorifico':
          case 'id_categoria_animal':
            value = typeof value === 'number' ? value : parseFloat(value) || 0;
            break;
          case 'trace':
          case 'hilton':
          case 'novilho_precoce':
            // Trata vários formatos possíveis para booleanos
            if (typeof value === 'string') {
              value = ['sim', 's', 'yes', 'y', 'true', '1'].includes(value.toLowerCase());
            } else if (typeof value === 'number') {
              value = value === 1;
            } else {
              value = !!value;
            }
            break;
        }
        
        item[mapping.dbField] = value;
      }
    });
    
    return item as ImportAbateData;
  });
};

// Função para validar dados processados
export const validateData = (data: ImportAbateData[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  data.forEach((item, index) => {
    const rowNum = index + 2; // +2 porque índice começa em 0 e já pulamos o cabeçalho
    
    // Validar data
    if (!item.data_abate) {
      errors.push({
        row: rowNum,
        field: 'data_abate',
        message: 'Data de abate é obrigatória'
      });
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(item.data_abate)) {
      errors.push({
        row: rowNum,
        field: 'data_abate',
        message: 'Formato de data inválido. Use YYYY-MM-DD'
      });
    }
    
    // Validar quantidade
    if (!item.quantidade || item.quantidade <= 0) {
      errors.push({
        row: rowNum,
        field: 'quantidade',
        message: 'Quantidade deve ser maior que zero'
      });
    }
    
    // Validar valor da arroba
    if (!item.valor_arroba_negociada || item.valor_arroba_negociada <= 0) {
      errors.push({
        row: rowNum,
        field: 'valor_arroba_negociada',
        message: 'Valor da arroba deve ser maior que zero'
      });
    }
    
    // Validar valor total
    if (!item.valor_total_acerto || item.valor_total_acerto <= 0) {
      errors.push({
        row: rowNum,
        field: 'valor_total_acerto',
        message: 'Valor total deve ser maior que zero'
      });
    }
    
    // Validar produtor
    if (!item.id_produtor) {
      errors.push({
        row: rowNum,
        field: 'id_produtor',
        message: 'Produtor é obrigatório'
      });
    }
    
    // Validar frigorífico
    if (!item.id_frigorifico) {
      errors.push({
        row: rowNum,
        field: 'id_frigorifico',
        message: 'Frigorífico é obrigatório'
      });
    }
    
    // Validar categoria
    if (!item.id_categoria_animal) {
      errors.push({
        row: rowNum,
        field: 'id_categoria_animal',
        message: 'Categoria do animal é obrigatória'
      });
    }
  });
  
  return errors;
};

// Função para importar dados validados
export const importData = async (data: ImportAbateData[]): Promise<{ success: number; errors: number }> => {
  let successCount = 0;
  let errorCount = 0;
  
  // Usar transação para garantir atomicidade
  const { error } = await supabase.rpc('bulk_insert_abates', {
    items: data
  });
  
  if (error) {
    console.error('Erro na importação em lote:', error);
    return { success: 0, errors: data.length };
  }
  
  return { success: data.length, errors: 0 };
};