// src/pages/abates/AbatesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataTable } from '../../components/DataTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Abate, getAbates, deleteAbate } from '../../services/abateService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const AbatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [abates, setAbates] = useState<Abate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAbate, setSelectedAbate] = useState<Abate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadAbates = async () => {
    setIsLoading(true);
    try {
      const data = await getAbates();
      setAbates(data);
    } catch (error) {
      console.error('Erro ao carregar abates:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar abates. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAbates();
  }, []);

  const handleAddAbate = () => {
    navigate('/abates/novo');
  };

  const handleEditAbate = (abate: Abate) => {
    navigate(`/abates/editar/${abate.id}`);
  };

  const handleViewAbate = (abate: Abate) => {
    navigate(`/abates/${abate.id}`);
  };

  const handleDeleteClick = (abate: Abate) => {
    setSelectedAbate(abate);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAbate) return;
    
    setIsDeleting(true);
    try {
      await deleteAbate(selectedAbate.id);
      setAbates(abates.filter(a => a.id !== selectedAbate.id));
      setSnackbar({
        open: true,
        message: 'Abate excluído com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir abate:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir abate. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedAbate(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { 
      id: 'data_abate', 
      label: 'Data', 
      minWidth: 120,
      format: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })
    },
    { 
      id: 'produtor', 
      label: 'Produtor',
      minWidth: 170,
      format: (value: any) => value?.nome || 'N/A'
    },
    { 
      id: 'frigorifico', 
      label: 'Frigorífico',
      minWidth: 170,
      format: (value: any) => value?.nome || 'N/A'
    },
    { 
      id: 'categoriaAnimal', 
      label: 'Categoria',
      minWidth: 150,
      format: (value: any) => value?.nome || 'N/A'
    },
    { id: 'nome_lote', label: 'Lote', minWidth: 150 },
    { 
      id: 'quantidade', 
      label: 'Qtd. Animais', 
      minWidth: 120,
      align: 'right' as 'right',
      format: (value: number) => value.toLocaleString('pt-BR')
    },
    { 
      id: 'valor_arroba_negociada', 
      label: 'Valor @', 
      minWidth: 120,
      align: 'right' as 'right',
      format: (value: number) => formatCurrency(value)
    },
    { 
      id: 'valor_total_acerto', 
      label: 'Valor Total', 
      minWidth: 140,
      align: 'right' as 'right',
      format: (value: number) => formatCurrency(value)
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Abates
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAbates}
            disabled={isLoading}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAbate}
          >
            Novo Abate
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={abates}
        isLoading={isLoading}
        onView={handleViewAbate}
        onEdit={handleEditAbate}
        onDelete={handleDeleteClick}
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Abate"
        message={`Tem certeza que deseja excluir o abate ID ${selectedAbate?.id} do lote ${selectedAbate?.nome_lote}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={isDeleting}
        severity="error"
      />

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

      <Tooltip title="Adicionar Abate">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddAbate}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default AbatesPage;