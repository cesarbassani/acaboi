// src/pages/agenda/components/AgendaPublicaCard.tsx
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface compatível com a estrutura retornada pela API
interface AgendaItem {
  id: number;
  data_abate: string;
  id_propriedade: number;
  propriedade_nome: string;
  id_produtor: number;
  produtor_nome: string;
  id_frigorifico: number;
  frigorifico_nome: string;
  quantidade: number;
}

interface AgendaPublicaCardProps {
  item: AgendaItem;
}

const AgendaPublicaCard: React.FC<AgendaPublicaCardProps> = ({ item }) => {
  const theme = useTheme();

  const dataFormatada = format(
    new Date(item.data_abate),
    "HH:mm", 
    { locale: ptBR }
  );

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderLeft: `4px solid ${theme.palette.primary.main}`, // Usar a cor primária do tema
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {dataFormatada}
        </Typography>
      </Box>

      <Typography variant="body1" fontWeight="bold" gutterBottom>
        {item.propriedade_nome || 'Propriedade não especificada'}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Produtor: {item.produtor_nome || 'Não especificado'}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Frigorífico: {item.frigorifico_nome || 'Não especificado'}
      </Typography>

      <Box sx={{ mt: 'auto', pt: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            px: 1,
            py: 0.5,
            borderRadius: 1
          }}
        >
          {item.quantidade} {item.quantidade === 1 ? 'Animal' : 'Animais'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AgendaPublicaCard;