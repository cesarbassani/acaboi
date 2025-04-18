// src/pages/reports/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, MenuItem, TextField, Tab, Tabs, CircularProgress, Snackbar, Alert } from '@mui/material';
import {
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { 
  DataGrid, 
  GridColDef,
  GridCellParams
} from '@mui/x-data-grid';

import { getAbatesReport, exportToExcel, exportToPDF, getResumoPorProdutor, getResumoPorFrigorifico, ReportFilters } from '../../services/reportService';
import { getProdutores } from '../../services/produtorService';
import { getFrigorificos } from '../../services/frigorificoService';
import { getCategorias } from '../../services/categoriaService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [produtor, setProdutor] = useState<number | ''>('');
  const [frigorifico, setFrigorifico] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [abatesData, setAbatesData] = useState<any[]>([]);
  const [produtoresData, setProdutoresData] = useState<any[]>([]);
  const [frigorificosData, setFrigorificosData] = useState<any[]>([]);
  
  const [produtoresOptions, setProdutoresOptions] = useState<any[]>([]);
  const [frigorificosOptions, setFrigorificosOptions] = useState<any[]>([]);
  const [categoriasOptions, setCategoriasOptions] = useState<any[]>([]);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [produtoresResult, frigorificosResult, categoriasResult] = await Promise.all([
          getProdutores(),
          getFrigorificos(),
          getCategorias()
        ]);
        
        setProdutoresOptions(produtoresResult);
        setFrigorificosOptions(frigorificosResult);
        setCategoriasOptions(categoriasResult);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados de filtro. Tente novamente.',
          severity: 'error'
        });
      }
    };
    
    loadOptions();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    loadTabData(newValue);
  };

  const handleApplyFilters = () => {
    const newFilters: ReportFilters = {};
    
    if (dataInicio) newFilters.dataInicio = dataInicio;
    if (dataFim) newFilters.dataFim = dataFim;
    if (produtor !== '') newFilters.idProdutor = Number(produtor);
    if (frigorifico !== '') newFilters.idFrigorifico = Number(frigorifico);
    if (categoria !== '') newFilters.idCategoria = Number(categoria);
    
    setFilters(newFilters);
    loadTabData(tabValue, newFilters);
  };

  const loadTabData = async (tab: number, filterData = filters) => {
    setIsLoading(true);
    try {
      switch (tab) {
        case 0:
          setAbatesData(await getAbatesReport(filterData));
          break;
        case 1:
          setProdutoresData(await getResumoPorProdutor(filterData));
          break;
        case 2:
          setFrigorificosData(await getResumoPorFrigorifico(filterData));
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = tabValue === 0 ? abatesData : tabValue === 1 ? produtoresData : frigorificosData;
      const filename = `relatorio-${['abates', 'produtores', 'frigorificos'][tabValue]}`;
      
      exportToExcel(data, filename);
      setSnackbar({
        open: true,
        message: 'Relatório exportado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao exportar o relatório. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleExportPDF = () => {
    try {
      const data = tabValue === 0 ? abatesData : tabValue === 1 ? produtoresData : frigorificosData;
      const filename = `relatorio-${['abates', 'produtores', 'frigorificos'][tabValue]}`;
      
      exportToPDF(data, filename);
      setSnackbar({
        open: true,
        message: 'PDF exportado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao exportar o PDF. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const abatesColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'data_abate', 
      headerName: 'Data', 
      width: 120,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Date(params.value as string).toLocaleDateString('pt-BR') : ''
    },
    { field: 'nome_lote', headerName: 'Lote', width: 150 },
    { field: 'quantidade', headerName: 'Quantidade', width: 110 },
    { 
      field: 'valor_arroba_negociada', 
      headerName: 'R$/Arroba', 
      width: 130,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value as number) : ''
    },
    { 
      field: 'valor_total_acerto', 
      headerName: 'Valor Total', 
      width: 130,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value as number) : ''
    },
    { 
      field: 'produtor_nome', 
      headerName: 'Produtor', 
      width: 180,
      valueGetter: (params: GridCellParams) => 
        params.row.produtor?.nome || 'N/A'
    },
    { 
      field: 'frigorifico_nome', 
      headerName: 'Frigorífico', 
      width: 180,
      valueGetter: (params: GridCellParams) => 
        params.row.frigorifico?.nome || 'N/A'
    },
    { 
      field: 'categoria_nome', 
      headerName: 'Categoria', 
      width: 150,
      valueGetter: (params: GridCellParams) => 
        params.row.categoriaAnimal?.nome || 'N/A'
    },
    { field: 'trace', headerName: 'TRACE', width: 100, type: 'boolean' },
    { field: 'hilton', headerName: 'HILTON', width: 100, type: 'boolean' },
    { field: 'novilho_precoce', headerName: 'Novilho Precoce', width: 140, type: 'boolean' }
  ];
  
  const produtoresColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nome', headerName: 'Nome', width: 200 },
    { field: 'propriedade', headerName: 'Propriedade', width: 200 },
    { field: 'totalAbates', headerName: 'Total de Abates', width: 150 },
    { field: 'totalAnimais', headerName: 'Total de Animais', width: 150 },
    { 
      field: 'valorTotal', 
      headerName: 'Valor Total', 
      width: 150,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value as number) : ''
    },
    { 
      field: 'mediaArroba', 
      headerName: 'Média Arroba', 
      width: 150,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value as number) : ''
    },
    { field: 'trace', headerName: 'TRACE', width: 100 },
    { field: 'hilton', headerName: 'HILTON', width: 100 },
    { field: 'novilhoPrecoce', headerName: 'Novilho Precoce', width: 140 }
  ];
  
  const frigorificosColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nome', headerName: 'Nome', width: 200 },
    { field: 'totalAbates', headerName: 'Total de Abates', width: 150 },
    { field: 'totalAnimais', headerName: 'Total de Animais', width: 150 },
    { 
      field: 'valorTotal', 
      headerName: 'Valor Total', 
      width: 150,
      valueFormatter: (params: GridCellParams) => 
        params.value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value as number) : ''
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>Relatórios</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Filtros</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            select
            label="Produtor"
            value={produtor}
            onChange={(e) => setProdutor(e.target.value as number | '')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {produtoresOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.nome}</MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Frigorífico"
            value={frigorifico}
            onChange={(e) => setFrigorifico(e.target.value as number | '')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {frigorificosOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.nome}</MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as number | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categoriasOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.nome}</MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Data inicial"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          
          <TextField
            label="Data final"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleApplyFilters}
            disabled={isLoading}
          >
            Aplicar Filtros
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<TableChartIcon />}
          onClick={handleExportExcel}
          disabled={isLoading || (abatesData.length === 0 && produtoresData.length === 0 && frigorificosData.length === 0)}
        >
          Exportar Excel
        </Button>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          disabled={isLoading || (abatesData.length === 0 && produtoresData.length === 0 && frigorificosData.length === 0)}
        >
          Exportar PDF
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Relatório de Abates" />
          <Tab label="Relatório por Produtor" />
          <Tab label="Relatório por Frigorífico" />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={abatesData}
                columns={abatesColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={produtoresData}
                columns={produtoresColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={frigorificosData}
                columns={frigorificosColumns}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
              />
            </Box>
          </TabPanel>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default ReportsPage;