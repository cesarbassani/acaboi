// src/pages/frigorificos/FrigorificosPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataTable } from '../../components/DataTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Frigorifico, getFrigorificos, deleteFrigorifico } from '../../services/frigorificoService';

const FrigorificosPage: React.FC = () => {
  const navigate = useNavigate();
  const [frigorificos, setFrigorificos] = useState<Frigorifico[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFrigorifico, setSelectedFrigorifico] = useState<Frigorifico | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadFrigorificos = async () => {
    setIsLoading(true);
    try {
      const data = await getFrigorificos();
      setFrigorificos(data);
    } catch (error) {
      console.error('Erro ao carregar frigoríficos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar frigoríficos. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFrigorificos();
  }, []);

  const handleAddFrigorifico = () => {
    navigate('/frigorificos/novo');
  };

  const handleEditFrigorifico = (frigorifico: Frigorifico) => {
    navigate(`/frigorificos/editar/${frigorifico.id}`);
  };

  const handleViewFrigorifico = (frigorifico: Frigorifico) => {
    navigate(`/frigorificos/${frigorifico.id}`);
  };

  const handleDeleteClick = (frigorifico: Frigorifico) => {
    setSelectedFrigorifico(frigorifico);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFrigorifico) return;
    
    setIsDeleting(true);
    try {
      await deleteFrigorifico(selectedFrigorifico.id);
      setFrigorificos(frigorificos.filter(f => f.id !== selectedFrigorifico.id));
      setSnackbar({
        open: true,
        message: 'Frigorífico excluído com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir frigorífico:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir frigorífico. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedFrigorifico(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'nome', label: 'Nome', minWidth: 170 },
    { id: 'cidade', label: 'Cidade', minWidth: 150 },
    { id: 'cnpj', label: 'CNPJ', minWidth: 140 },
    { 
      id: 'created_at', 
      label: 'Data de Cadastro', 
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Frigoríficos
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadFrigorificos}
            disabled={isLoading}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddFrigorifico}
          >
            Novo Frigorífico
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={frigorificos}
        isLoading={isLoading}
        onView={handleViewFrigorifico}
        onEdit={handleEditFrigorifico}
        onDelete={handleDeleteClick}
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Frigorífico"
        message={`Tem certeza que deseja excluir o frigorífico ${selectedFrigorifico?.nome}? Esta ação não pode ser desfeita.`}
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

      <Tooltip title="Adicionar Frigorífico">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddFrigorifico}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default FrigorificosPage;