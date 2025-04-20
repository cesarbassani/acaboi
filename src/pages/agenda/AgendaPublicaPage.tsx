// src/pages/agenda/AgendaPublicaPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Adicione esta importação
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Container,
  Divider,
  Alert,
  useTheme,
  Card,
  CardContent,
  Chip,
  Button
} from '@mui/material';
import { supabase } from '../../services/supabase'; // Usar diretamente o cliente Supabase existente
import { format, addDays, subDays} from 'date-fns';
import PublicLayout from '../../layouts/PublicLayout';

// Definir interface conforme a estrutura real retornada pela API
interface AgendaItem {
  id: number;
  data_abate: string;

  id_produtor: number;
  produtor_nome: string;

  id_frigorifico: number;
  frigorifico_nome: string;

  quantidade: number;
  categoria: string;

  tecnico_responsavel_nome: string;
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

const AgendaPublicaPage: React.FC = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams(); // Para ler os parâmetros da URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendamentos, setAgendamentos] = useState<AgendaItem[]>([]);

  const [totalAnimais, setTotalAnimais] = useState(0);

  // Dias da semana para exibição
  const diasDaSemana = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const diasDaSemanaLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const urlSemana = searchParams.get('semana');
  const urlAno = searchParams.get('ano');

  // Criar data inicial baseada nos parâmetros da URL ou data atual
  const initialDate = (() => {
    if (urlSemana && urlAno) {
      // Calcular a data do primeiro dia da semana especificada
      // Nota: Esta é uma implementação simplificada, pode precisar de ajustes
      const ano = parseInt(urlAno);
      const semana = parseInt(urlSemana);
      
      // Criar uma data para o primeiro dia do ano
      const firstDayOfYear = new Date(ano, 0, 1);
      // Adicionar dias para chegar à semana desejada (semanas começam do 0)
      const desiredDate = new Date(firstDayOfYear);
      desiredDate.setDate(firstDayOfYear.getDate() + (semana - 1) * 7);
      
      return desiredDate;
    }
    return new Date(); // Data atual como fallback
  })();

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);  

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setLoading(true);
        
        // calcula 2ª e sábado da semana corrente
        const today = new Date(currentDate);
        const dayOfWeek = today.getDay() || 7; // domingo=0 → 7
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1);
        monday.setHours(0,0,0,0);
        const saturday = new Date(monday);
        saturday.setDate(monday.getDate() + 5);
        saturday.setHours(23,59,59,999);

        // lê da view pública em vez da tabela direta
        const { data, error } = await supabase
          .from('view_agenda_abates')
          .select('*')
          .gte('data_abate', monday.toISOString())
          .lte('data_abate', saturday.toISOString())
          .order('data_abate', { ascending: true });
          
        if (error) throw error;
        
        console.log('Agendamentos recebidos:', data);
        
        // Transformar os dados para o formato esperado pela interface
        const formattedData = (data || []).map(item => ({
          id: item.id,
          data_abate: item.data_abate,
        
          id_produtor: item.id_produtor,
          produtor_nome: item.produtor_nome    || 'Sem produtor',
        
          id_frigorifico: item.id_frigorifico,
          frigorifico_nome: item.frigorifico_nome || 'Sem frigorífico',
        
          quantidade: item.quantidade,
          categoria: item.categoria,
          tecnico_responsavel_nome: item.tecnico_responsavel_nome || 'Sem técnico'
        }));
        
        setAgendamentos(formattedData);
        
        // Calcular total de animais
        const total = formattedData.reduce((sum, item) => sum + item.quantidade, 0);
        setTotalAnimais(total);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
        setError('Não foi possível carregar os agendamentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgenda();
  }, [currentDate]);

  // Processar agendamentos por dia da semana
  const agendamentosPorDia = diasDaSemana.map((dia, index) => {
    // Calcular a data para este dia da semana
    const dataDoDia = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuste quando é domingo
    dataDoDia.setDate(diff + index);
    dataDoDia.setHours(0, 0, 0, 0);
    
    // Data no formato YYYY-MM-DD
    const dataFormatada = format(dataDoDia, 'yyyy-MM-dd');
    
    // Filtrar agendamentos para este dia
    const agendasDoDia = agendamentos.filter(agenda => {
      const dataAgendamento = agenda.data_abate.split('T')[0]; // Pegar apenas a parte da data
      return dataAgendamento === dataFormatada;
    });
    
    const totalDoDia = agendasDoDia.reduce((sum, a) => sum + a.quantidade, 0);
    return { dia, agendas: agendasDoDia, total: totalDoDia };
  });

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  // Formatar a data do dia da semana
  const formatData = (dia: string, index: number): string => {
    // Calcular a data para este dia da semana
    const dataDoDia = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuste quando é domingo
    dataDoDia.setDate(diff + index);
    return format(dataDoDia, 'dd/MM/yyyy');
  };

  // Obter número da semana atual
  const semanaNumber = format(currentDate, 'w');
  const anoNumber = format(currentDate, 'yyyy');

  return (
    <PublicLayout>
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            overflow: 'hidden',
            height: { xs: 'auto', md: '90vh' },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Cabeçalho similar ao modal original */}
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">Semana {semanaNumber} - {anoNumber}</Typography>
            
            {/* Botões de navegação */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2
            }}>
              <Button 
                variant="text" 
                onClick={handlePreviousWeek}
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  minWidth: 'auto',
                  p: 1
                }}
              >
                Semana Anterior
              </Button>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Button 
                variant="text" 
                onClick={handleNextWeek}
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  minWidth: 'auto',
                  p: 1
                }}
              >
                Próxima Semana
              </Button>
            </Box>
            
            {/* Total de animais */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                Total: <Chip label={totalAnimais} size="small" sx={{ ml: 1, bgcolor: 'white', color: 'black' }} />
              </Typography>
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5, flex: 1 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <Box sx={{ 
              display: 'flex', 
              flexGrow: 1,
              flexDirection: { xs: 'column', md: 'row' },
              overflow: 'auto',
              p: { xs: 1, md: 0 },
              height: { xs: 'auto', md: 'calc(90vh - 120px)' } // Ajuste para a altura da página
            }}>
              {agendamentosPorDia.map((diaAgendas, index) => (
                <Box key={diaAgendas.dia} sx={{
                  flex: 1, 
                  minWidth: { xs: '100%', md: 0 },
                  borderRight: index < agendamentosPorDia.length - 1 ? '1px solid #ddd' : 'none',
                  display: 'flex', 
                  flexDirection: 'column', 
                  bgcolor: 'white',
                  mb: { xs: 2, md: 0 }
                }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {diasDaSemanaLabels[index]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatData(diaAgendas.dia, index)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Total: <Chip label={diaAgendas.total} size="small" color="primary" />
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, overflow: 'auto', flex: 1 }}>
                    {diaAgendas.agendas.length === 0 ? (
                      <Box sx={{
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center',
                        color: 'text.secondary', 
                        p: 2, 
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">Sem agendamentos</Typography>
                      </Box>
                    ) : (
                      diaAgendas.agendas.map(agenda => {
                        const dayColor = getDayColor(diaAgendas.dia);
                        return (
                          <Card key={agenda.id} sx={{ 
                            mb: 1, 
                            borderRadius: 1, 
                            bgcolor: dayColor, 
                            color: 'white' 
                          }} elevation={0}>
                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                              <Box sx={{ 
                                bgcolor: 'rgba(0,0,0,0.15)', 
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
                                  {agenda.categoria || 'N/A'}
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
          )}
        </Paper>
      </Container>
    </PublicLayout>
  );
};

export default AgendaPublicaPage;