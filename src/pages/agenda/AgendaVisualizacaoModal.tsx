import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AgendaAbate, getDateRangeForWeek } from '../../services/agendaAbatesService';
import { parseDateLocal } from '../../utils/formatters';
import CompartilharAgendaButton from './components/CompartilharAgendaButton';

interface AgendaVisualizacaoModalProps {
  open: boolean;
  onClose: () => void;
  agendamentos: AgendaAbate[];
  semana: number;
  ano: number;
}

const getDayColor = (day: string): string => {
  const colors: Record<string, string> = {
    'Monday': '#5981B8',
    'Tuesday': '#B35751',
    'Wednesday': '#A2B966',
    'Thursday': '#7B679E',
    'Friday': '#64AAC3',
    'Saturday': '#EA9956'
  };
  return colors[day] || '#f5f5f5';
};

const AgendaVisualizacaoModal: React.FC<AgendaVisualizacaoModalProps> = ({
  open,
  onClose,
  agendamentos,
  semana,
  ano
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (open) {
      console.log("Agendamentos recebidos:", agendamentos);
      const { start, end } = getDateRangeForWeek(semana, ano);
      console.log("Intervalo da semana:", start.toISOString(), end.toISOString());
    }
  }, [open, agendamentos, semana, ano]);

  const diasDaSemana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const diasDaSemanaLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const dateRange = getDateRangeForWeek(semana, ano);

  const agendamentosPorDia = diasDaSemana.map(dia => {
    const agendasDoDia = agendamentos.filter(agenda => {
      const dataAbate = parseDateLocal(agenda.data_abate);
      // filtra dentro da semana
      if (dataAbate < dateRange.start || dataAbate > dateRange.end) return false;
      const diaSemanaAgenda = dataAbate.toLocaleDateString('en-US', { weekday: 'long' });
      return diaSemanaAgenda === dia;
    });
    const totalDoDia = agendasDoDia.reduce((sum, a) => sum + a.quantidade, 0);
    return { dia, agendas: agendasDoDia, total: totalDoDia };
  });

  const totalGeral = agendamentos.reduce((sum, a) => sum + a.quantidade, 0);

  const formatData = (dia: string): string => {
    const idx = diasDaSemana.indexOf(dia);
    if (idx === -1) return '';
    const dt = new Date(dateRange.start);
    dt.setDate(dt.getDate() + idx);
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { bgcolor: 'white', height: fullScreen ? '100%' : '90vh' }
      }}
    >
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', bgcolor: theme.palette.primary.main, color: 'white'
      }}>
        <Typography variant="h6">Semana {semana}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>
            Total: <Chip label={totalGeral} size="small" sx={{ ml: 1, bgcolor: 'white', color: 'black' }} />
          </Typography>
          <CompartilharAgendaButton semana={semana} ano={ano} />
          <IconButton onClick={onClose} color="inherit" size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{
          display: 'flex', height: '100%',
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'auto'
        }}>
          {agendamentosPorDia.map((diaAgendas, index) => (
            <Box key={diaAgendas.dia} sx={{
              flex: 1, minWidth: { xs: '100%', md: 0 },
              borderRight: index < agendamentosPorDia.length - 1 ? '1px solid #ddd' : 'none',
              display: 'flex', flexDirection: 'column', bgcolor: 'white'
            }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {diasDaSemanaLabels[index]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatData(diaAgendas.dia)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total: <Chip label={diaAgendas.total} size="small" color="primary" />
                </Typography>
              </Box>
              <Box sx={{ p: 1, overflow: 'auto', flex: 1 }}>
                {diaAgendas.agendas.length === 0 ? (
                  <Box sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    color: 'text.secondary', p: 2, borderRadius: 1
                  }}>
                    <Typography variant="body2" color="black">Sem agendamentos</Typography>
                  </Box>
                ) : (
                  diaAgendas.agendas.map(agenda => {
                    const dayColor = getDayColor(diaAgendas.dia);
                    return (
                      <Card key={agenda.id} sx={{ mb: 1, borderRadius: 1, bgcolor: dayColor, color: 'white' }} elevation={0}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ 
                          bgcolor: 'rgba(0,0,0,0.15)', // tom mais escuro sobre a cor do card
                          p: 0.5, 
                          borderRadius: 1, 
                          mb: 1 
                        }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ textTransform: 'uppercase' }}>
                            {agenda.tecnico_responsavel_nome || 'Sem técnico agendado'}
                          </Typography>
                        </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {agenda.frigorifico_nome || 'Sem frigorífico agendado'}
                          </Typography>
                          <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                            {agenda.produtor_nome || 'Sem produtor agendado'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {agenda.categoria}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {agenda.quantidade}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #ddd', p: 2 }}>
        <Button onClick={onClose} variant="contained">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgendaVisualizacaoModal;
