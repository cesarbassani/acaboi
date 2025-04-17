// src/pages/dashboard/Dashboard.tsx
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Divider,
  useTheme,
  Stack
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  MonetizationOn as MonetizationOnIcon,
  People as PeopleIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import { useAuth } from '../../store/AuthContext';

// Exemplo de widget para o dashboard
const InfoCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              backgroundColor: color || theme.palette.primary.main,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0];

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
        Olá, {userName}!
      </Typography>

      {/* Substituindo Grid por uma Stack com flexbox */}
      <Stack spacing={3}>
        {/* Cards informativos */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', lg: '22%' }, minWidth: '250px' }}>
            <InfoCard 
              title="Abates Realizados" 
              value="243" 
              subtitle="Últimos 30 dias"
              icon={<InventoryIcon />}
            />
          </Box>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', lg: '22%' }, minWidth: '250px' }}>
            <InfoCard 
              title="Animais Abatidos" 
              value="3,721" 
              subtitle="Últimos 30 dias"
              icon={<PetsIcon />}
              color="#4caf50"
            />
          </Box>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', lg: '22%' }, minWidth: '250px' }}>
            <InfoCard 
              title="Faturamento" 
              value="R$ 1.237.450" 
              subtitle="Últimos 30 dias"
              icon={<MonetizationOnIcon />}
              color="#ff9800"
            />
          </Box>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '45%', lg: '22%' }, minWidth: '250px' }}>
            <InfoCard 
              title="Produtores Ativos" 
              value="38" 
              subtitle="Este mês"
              icon={<PeopleIcon />}
              color="#2196f3"
            />
          </Box>
        </Box>

        {/* Seção principal */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
            Atividades Recentes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" color="text.secondary">
            Bem-vindo ao Sistema de Gestão de Abates ACABOI!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Este é o dashboard inicial. Aqui serão exibidas informações relevantes conforme o sistema for sendo utilizado.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard;