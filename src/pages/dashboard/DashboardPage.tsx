// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, CircularProgress, Snackbar, Alert, MenuItem, FormControl, InputLabel, Select, Button } from '@mui/material';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material';
import {
  Inventory as InventoryIcon,
  MonetizationOn as MonetizationOnIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getDashboardSummary, getRecentActivities } from '../../services/dashboardService';
import { useAuth } from '../../store/AuthContext';
import InfoCard from '../../components/dashboard/InfoCard';
import BarChartCard from '../../components/dashboard/BarChartCard';
import LineChartCard from '../../components/dashboard/LineChartCard';
import PieChartCard from '../../components/dashboard/PieChartCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const userType = user?.user_metadata?.type || 'produtor';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0];

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Calcular datas para o filtro de período
      const dataFim = new Date();
      const dataInicio = subMonths(dataFim, parseInt(selectedPeriod));

      // Buscar dados do dashboard
      const dashboardData = await getDashboardSummary(
        userType,
        user?.id,
        {
          dataInicio: format(dataInicio, 'yyyy-MM-dd'),
          dataFim: format(dataFim, 'yyyy-MM-dd')
        }
      );
      
      // Buscar atividades recentes
      const activities = await getRecentActivities(10);
      
      setSummary(dashboardData);
      setRecentActivities(activities);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do dashboard. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, user, userType]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading || !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Preparar dados para gráfico de categorias
  const categoriasData = summary.abatesPorCategoria.map((item: any) => ({
    categoria: item.categoria,
    quantidade: item.quantidade
  }));

  // Preparar dados para gráfico de evolução mensal
  const mesesData = summary.abatesPorMes.map((item: any) => ({
    mes: format(new Date(item.mes + '-01'), 'MMM/yy', { locale: ptBR }),
    quantidade: item.quantidade,
    valor: item.valor
  }));

  // Preparar dados para gráfico de bonificações
  const bonificacoesData = [
    { name: 'TRACE', value: summary.bonificacoes.trace },
    { name: 'HILTON', value: summary.bonificacoes.hilton },
    { name: 'Novilho Precoce', value: summary.bonificacoes.novilhoPrecoce }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Olá, {userName}!
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="period-select-label">Período</InputLabel>
            <Select
              labelId="period-select-label"
              value={selectedPeriod}
              onChange={handlePeriodChange}
              label="Período"
            >
              <MenuItem value="30">Últimos 30 dias</MenuItem>
              <MenuItem value="90">Últimos 90 dias</MenuItem>
              <MenuItem value="180">Últimos 6 meses</MenuItem>
              <MenuItem value="365">Último ano</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Cards KPI - Usando Box com flexbox em vez de Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <InfoCard
            title="Abates Realizados"
            value={summary.totalAbates}
            subtitle={`No período selecionado`}
            icon={<InventoryIcon />}
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <InfoCard
            title="Animais Abatidos"
            value={summary.totalAnimais.toLocaleString('pt-BR')}
            subtitle={`Média por abate: ${(summary.totalAnimais / summary.totalAbates || 0).toFixed(1)}`}
            icon={<PetsIcon />}
            color="#4caf50"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <InfoCard
            title="Valor Total"
            value={formatCurrency(summary.valorTotalAcerto)}
            subtitle={`Média por animal: ${formatCurrency(summary.valorTotalAcerto / summary.totalAnimais || 0)}`}
            icon={<MonetizationOnIcon />}
            color="#ff9800"
          />
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <InfoCard
            title="Preço Médio Arroba"
            value={formatCurrency(summary.mediaArrobaNegociada)}
            subtitle={`Média por arroba negociada`}
            icon={<DateRangeIcon />}
            color="#2196f3"
          />
        </Box>
      </Box>

      {/* Gráficos - Usando Box com flexbox em vez de Grid */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 500px', minWidth: 0 }}>
            <BarChartCard
              title="Animais por Categoria"
              subtitle="Distribuição por categoria animal"
              data={categoriasData}
              dataKey="quantidade"
              categoryKey="categoria"
            />
          </Box>
          <Box sx={{ flex: '1 1 500px', minWidth: 0 }}>
            <PieChartCard
              title="Bonificações"
              subtitle="Distribuição por tipo de bonificação"
              data={bonificacoesData}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <LineChartCard
              title="Evolução Mensal"
              subtitle="Quantidade de animais e valor total por mês"
              data={mesesData}
              xAxisKey="mes"
              lines={[
                { dataKey: 'quantidade', color: '#A6CE39', name: 'Quantidade' },
                { dataKey: 'valor', color: '#ff9800', name: 'Valor Total (R$)' }
              ]}
            />
          </Box>
        </Box>
      </Box>

      {/* Atividades Recentes */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
            Atividades Recentes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {recentActivities.length > 0 ? (
            <Box>
              {recentActivities.map((activity) => (
                <Box 
                  key={activity.id} 
                  sx={{ 
                    py: 1.5, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider' 
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={500}>
                      Abate do lote "{activity.nome_lote}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Produtor: {activity.produtor?.nome || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Frigorífico: {activity.frigorifico?.nome || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Quantidade: {activity.quantidade} animais | 
                    Valor: {formatCurrency(activity.valor_total_acerto)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Nenhuma atividade recente para exibir.
            </Typography>
          )}
        </Paper>
      </Box>

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

export default DashboardPage;