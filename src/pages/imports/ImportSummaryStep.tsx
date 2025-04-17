// src/components/imports/ImportSummaryStep.tsx
import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ImportSummaryStepProps {
  result: { success: number; errors: number } | null;
  onRestart: () => void;
}

const ImportSummaryStep: React.FC<ImportSummaryStepProps> = ({ result, onRestart }) => {
  const navigate = useNavigate();
  
  const handleGoToAbates = () => {
    navigate('/abates');
  };
  
  if (!result) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">
          Não há dados de importação disponíveis.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={onRestart}
          sx={{ mt: 2 }}
        >
          Iniciar Nova Importação
        </Button>
      </Box>
    );
  }
  
  const isSuccess = result.errors === 0 && result.success > 0;
  
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}
      >
        {isSuccess ? (
          <CheckIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main',
              mb: 2
            }} 
          />
        ) : (
          <ErrorIcon 
            sx={{ 
              fontSize: 80, 
              color: result.errors > 0 ? 'warning.main' : 'error.main',
              mb: 2
            }} 
          />
        )}
        
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {isSuccess 
            ? 'Importação Concluída com Sucesso!' 
            : result.success > 0 
              ? 'Importação Concluída com Avisos' 
              : 'Falha na Importação'
          }
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {isSuccess
            ? `Todos os ${result.success} registros foram importados com sucesso.`
            : result.success > 0
              ? `${result.success} registros foram importados, mas ocorreram problemas com ${result.errors} registros.`
              : 'Nenhum registro foi importado devido a erros.'
          }
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumo da Importação
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Total de registros processados:</Typography>
          <Typography fontWeight={600}>{result.success + result.errors}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Registros importados com sucesso:</Typography>
          <Typography fontWeight={600} color="success.main">{result.success}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Registros com falha:</Typography>
          <Typography fontWeight={600} color={result.errors > 0 ? 'error.main' : 'inherit'}>
            {result.errors}
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRestart}
        >
          Nova Importação
        </Button>
        
        <Button 
          variant="contained"
          onClick={handleGoToAbates}
        >
          Ir para Lista de Abates
        </Button>
      </Box>
    </Box>
  );
};

export default ImportSummaryStep;