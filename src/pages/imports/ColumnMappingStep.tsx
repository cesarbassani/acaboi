// src/components/imports/ColumnMappingStep.tsx
import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { ColumnMapping } from '../../services/importService';

interface ColumnMappingStepProps {
  headers: string[];
  mapping: ColumnMapping[];
  onMappingChange: (mapping: ColumnMapping[]) => void;
}

const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({ headers, mapping, onMappingChange }) => {
  const dbFields = [
    { value: 'data_abate', label: 'Data do Abate *' },
    { value: 'nome_lote', label: 'Nome do Lote' },
    { value: 'quantidade', label: 'Quantidade *' },
    { value: 'valor_arroba_negociada', label: 'Valor da Arroba *' },
    { value: 'valor_total_acerto', label: 'Valor Total *' },
    { value: 'id_produtor', label: 'Produtor *' },
    { value: 'id_frigorifico', label: 'Frigorífico *' },
    { value: 'id_categoria_animal', label: 'Categoria *' },
    { value: 'trace', label: 'TRACE' },
    { value: 'hilton', label: 'HILTON' },
    { value: 'novilho_precoce', label: 'Novilho Precoce' }
  ];
  
  const handleMappingChange = (sheetColumn: string, dbField: string | null) => {
    const newMapping = [...mapping];
    const existingIndex = newMapping.findIndex(m => m.sheetColumn === sheetColumn);
    
    if (dbField) {
      // Se já existe um mapeamento para este campo DB, remova-o
      const existingDbFieldIndex = newMapping.findIndex(m => m.dbField === dbField);
      if (existingDbFieldIndex !== -1 && existingDbFieldIndex !== existingIndex) {
        newMapping.splice(existingDbFieldIndex, 1);
      }
      
      if (existingIndex !== -1) {
        // Atualizar mapeamento existente
        newMapping[existingIndex].dbField = dbField as keyof ColumnMapping['dbField'];
      } else {
        // Adicionar novo mapeamento
        newMapping.push({ 
          sheetColumn, 
          dbField: dbField as keyof ColumnMapping['dbField']
        });
      }
    } else if (existingIndex !== -1) {
      // Remover mapeamento
      newMapping.splice(existingIndex, 1);
    }
    
    onMappingChange(newMapping);
  };
  
  const getMappedDbField = (sheetColumn: string) => {
    const found = mapping.find(m => m.sheetColumn === sheetColumn);
    return found ? found.dbField : null;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mapeamento de Colunas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Associe as colunas da sua planilha aos campos do sistema. Campos marcados com * são obrigatórios.
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Coluna na Planilha</TableCell>
              <TableCell>Campo no Sistema</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell>{header}</TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <InputLabel>Campo</InputLabel>
                    <Select
                      value={getMappedDbField(header)?.toString() || ''}
                      onChange={(e: SelectChangeEvent) => handleMappingChange(header, e.target.value)}
                      label="Campo"
                    >
                      <MenuItem value="">Não mapear</MenuItem>
                      {dbFields.map((field) => (
                        <MenuItem
                          key={field.value}
                          value={field.value}
                          disabled={mapping.some(m => m.dbField === field.value && m.sheetColumn !== header)}
                        >
                          {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ColumnMappingStep;