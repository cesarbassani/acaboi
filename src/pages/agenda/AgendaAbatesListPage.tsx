import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { 
  AgendaAbate, 
  getAgendaAbates, 
  getCurrentWeekNumber, 
  getCurrentYear,
  getWeeksInYear,
  getDaysOfWeek
} from '../../services/agendaAbatesService';
import { getFrigorificosSelect } from '../../services/escalaService';
import { getProdutores } from '../../services/produtorService';
import { getTecnicos } from '../../services/escalaService';
import AgendaVisualizacaoModal from './AgendaVisualizacaoModal';
import { formatDayOfWeek, parseDateLocal, formatDateBR } from '../../utils/formatters';

const AgendaAbatesListPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<AgendaAbate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Filtros
  const [semana, setSemana] = useState<number>(getCurrentWeekNumber());
  const [ano, setAno] = useState<number>(getCurrentYear());
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [tecnicoId, setTecnicoId] = useState<number | ''>('');
  const [frigorificoId, setFrigorificoId] = useState<number | ''>('');
  const [produtorId, setProdutorId] = useState<number | ''>('');
  
  // Dados para selects
  const [semanas, setSemanas] = useState<number[]>([]);
  const [anos] = useState<number[]>([getCurrentYear() - 1, getCurrentYear(), getCurrentYear() + 1]);
  const [diasDaSemana] = useState(getDaysOfWeek());
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    setSemanas(getWeeksInYear(ano));
  }, [ano]);

  useEffect(() => {
    loadAgendamentos();
  }, [semana, ano, diasSemana, tecnicoId, frigorificoId, produtorId]);

  useEffect(() => {
    loadTecnicos();
    loadFrigorificos();
    loadProdutores();
  }, []);

  const loadAgendamentos = useCallback(async () => {
    setIsLoading(true);
    try {
      const filtros = {
        semana,
        ano,
        dia_semana: diasSemana.length > 0 ? diasSemana : undefined,
        id_tecnico: tecnicoId !== '' ? Number(tecnicoId) : undefined,
        id_frigorifico: frigorificoId !== '' ? Number(frigorificoId) : undefined,
        id_produtor: produtorId !== '' ? Number(produtorId) : undefined
      };
      
      const data = await getAgendaAbates(filtros);
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar agendamentos. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    // Dependências:
    semana, 
    ano, 
    diasSemana, 
    tecnicoId, 
    frigorificoId, 
    produtorId,
    setAgendamentos, 
    setIsLoading, 
    setSnackbar
  ]);

  const loadTecnicos = async () => {
    try {
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
    }
  };

  const loadFrigorificos = async () => {
    try {
    } catch (error) {
      console.error('Erro ao carregar frigoríficos:', error);
    }
  };

  const loadProdutores = async () => {
    try {
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDiasSemanaChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setDiasSemana(typeof value === 'string' ? value.split(',') : value);
  };

  const handleOpenAgendaModal = () => {
    setIsAgendaModalOpen(true);
  };

  const handleCloseAgendaModal = () => {
    setIsAgendaModalOpen(false);
  };

  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const resetFilters = () => {
    setSemana(getCurrentWeekNumber());
    setAno(getCurrentYear());
    setDiasSemana([]);
    setTecnicoId('');
    setFrigorificoId('');
    setProdutorId('');
  };

  const totalAnimais = agendamentos.reduce((acc, agenda) => acc + agenda.quantidade, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Agenda de Abates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAgendamentos}
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleOpenFilterDialog}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={handleOpenAgendaModal}
          >
            AGENDA
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="semana-label">Semana</InputLabel>
          <Select
            labelId="semana-label"
            value={semana}
            label="Semana"
            onChange={(e) => setSemana(Number(e.target.value))}
          >
            {semanas.map((sem) => (
              <MenuItem key={sem} value={sem}>{sem}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="ano-label">Ano</InputLabel>
          <Select
            labelId="ano-label"
            value={ano}
            label="Ano"
            onChange={(e) => setAno(Number(e.target.value))}
          >
            {anos.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
          <InputLabel id="dias-semana-label">Dias da Semana</InputLabel>
          <Select
            labelId="dias-semana-label"
            multiple
            value={diasSemana}
            onChange={handleDiasSemanaChange}
            input={<OutlinedInput label="Dias da Semana" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={diasDaSemana.find(d => d.value === value)?.label || value} 
                    size="small" 
                  />
                ))}
              </Box>
            )}
          >
            {diasDaSemana.map((dia) => (
              <MenuItem key={dia.value} value={dia.value}>
                {dia.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          Total: <Chip label={totalAnimais} color="primary" sx={{ ml: 1 }} />
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell  sx={{ fontWeight: 'bold' }}>Nome do Dia</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>DATA ABATE</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>FRIGORÍFICO</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>QTD</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>CAT.</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>PRODUTOR</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>RESPONSÁVEL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agendamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                agendamentos.map((agenda) => (
                  <TableRow key={agenda.id}>
                    <TableCell>{agenda.dia_semana
                      ? formatDayOfWeek(agenda.dia_semana)
                      : '—'}</TableCell>
                    <TableCell>{formatDateBR(parseDateLocal(agenda.data_abate))}</TableCell>
                    <TableCell>{agenda.frigorifico_nome}</TableCell>
                    <TableCell>{agenda.quantidade}</TableCell>
                    <TableCell>{agenda.categoria}</TableCell>
                    <TableCell>{agenda.produtor_nome}</TableCell>
                    <TableCell>
                      {agenda.tecnico_responsavel_nome || 'Sem técnico agendado'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AgendaVisualizacaoModal
        open={isAgendaModalOpen}
        onClose={handleCloseAgendaModal}
        agendamentos={agendamentos}
        semana={semana}
        ano={ano}
      />

      <Dialog open={isFilterDialogOpen} onClose={handleCloseFilterDialog}>
        <DialogTitle>Filtros Avançados</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400, mt: 1 }}>
            {/* ... mesmos selects de técnico, frigorífico e produtor ... */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters} color="secondary">Limpar Filtros</Button>
          <Button onClick={handleCloseFilterDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default AgendaAbatesListPage;
