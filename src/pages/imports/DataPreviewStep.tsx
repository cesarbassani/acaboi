// src/components/imports/DataPreviewStep.tsx
import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip } from '@mui/material';
import { ImportAbateData, ValidationError } from '../../services/importService';

interface DataPreviewStepProps {
  data: ImportAbateData[];
  validationErrors: ValidationError[];
  produtores: any[];
  frigorificos: any[];
  categorias: any[];
}

const DataPreviewStep: React.FC<DataPreviewStepProps> = ({ 
  data, 
  validationErrors, 
  produtores, 
  frigorificos, 
  categorias 
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getProdutor = (id: number) => {
    const produtor = produtores.find(p => p.id === id);
    return produtor ? produtor.nome : `ID: ${id}`;
  };

  const getFrigorifico = (id: number) => {
    const frigorifico = frigorificos.find(f => f.id === id);
    return frigorifico ? frigorifico.nome : `ID: ${id}`;
  };

  const getCategoria = (id: number) => {
    const categoria = categorias.find(c => c.id === id);
    return categoria ? categoria.nome : `ID: ${id}`;
  };

  const getErrorsForRow = (rowIndex: number): ValidationError[] => {
    return validationErrors.filter(error => error.row === rowIndex + 2);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Visualização dos Dados
      </Typography>
      
      {validationErrors.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Atenção: {validationErrors.length} erro(s) encontrado(s)
          </Typography>
          <Typography variant="body2">
            Corrija os erros antes de prosseguir com a importação. As linhas com erros estão destacadas em vermelho.
          </Typography>
        </Paper>
      )}
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Linha</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Valor Arroba</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Produtor</TableCell>
              <TableCell>Frigorífico</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Certificações</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const rowIndex = page * rowsPerPage + index;
                const rowErrors = getErrorsForRow(rowIndex);
                const hasErrors = rowErrors.length > 0;
                
                return (
                  <TableRow 
                    key={rowIndex}
                    sx={{ 
                      bgcolor: hasErrors ? 'error.lighter' : 'inherit',
                      '&:hover': { bgcolor: hasErrors ? 'error.light' : 'action.hover' }
                    }}
                  >
                    <TableCell>{rowIndex + 2}</TableCell>
                    <TableCell>{formatDate(row.data_abate)}</TableCell>
                    <TableCell>{row.nome_lote}</TableCell>
                    <TableCell>{row.quantidade}</TableCell>
                    <TableCell>{formatCurrency(row.valor_arroba_negociada)}</TableCell>
                    <TableCell>{formatCurrency(row.valor_total_acerto)}</TableCell>
                    <TableCell>{getProdutor(row.id_produtor)}</TableCell>
                    <TableCell>{getFrigorifico(row.id_frigorifico)}</TableCell>
                    <TableCell>{getCategoria(row.id_categoria_animal)}</TableCell>
                    <TableCell>
                      {row.trace && <Chip label="TRACE" size="small" color="success" sx={{ mr: 0.5 }} />}
                      {row.hilton && <Chip label="HILTON" size="small" color="primary" sx={{ mr: 0.5 }} />}
                      {row.novilho_precoce && <Chip label="Novilho Precoce" size="small" color="warning" />}
                    </TableCell>
                    <TableCell>
                      {hasErrors ? (
                        <Chip 
                          label={`${rowErrors.length} erro(s)`} 
                          size="small" 
                          color="error"
                          onClick={() => {
                            alert(rowErrors.map(e => `${e.field}: ${e.message}`).join('\n'));
                          }}
                        />
                      ) : (
                        <Chip label="OK" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2">
          Total de registros: <strong>{data.length}</strong>
        </Typography>
        <Typography variant="body2">
          Registros válidos: <strong>{data.length - validationErrors.length}</strong>
        </Typography>
        <Typography variant="body2">
          Registros com erro: <strong>{validationErrors.length}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export default DataPreviewStep;