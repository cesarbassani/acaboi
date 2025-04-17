// src/pages/produtores/ProdutoresPage.tsx
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
import { Produtor, getProdutores, deleteProdutor } from '../../services/produtorService';

const ProdutoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProdutor, setSelectedProdutor] = useState<Produtor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadProdutores = async () => {
    setIsLoading(true);
    try {
      const data = await getProdutores();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar produtores. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProdutores();
  }, []);

  const handleAddProdutor = () => {
    navigate('/produtores/novo');
  };

  const handleEditProdutor = (produtor: Produtor) => {
    navigate(`/produtores/editar/${produtor.id}`);
  };

  const handleViewProdutor = (produtor: Produtor) => {
    navigate(`/produtores/${produtor.id}`);
  };

  const handleDeleteClick = (produtor: Produtor) => {
    setSelectedProdutor(produtor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProdutor) return;
    
    setIsDeleting(true);
    try {
      await deleteProdutor(selectedProdutor.id);
      setProdutores(produtores.filter(p => p.id !== selectedProdutor.id));
      setSnackbar({
        open: true,
        message: 'Produtor excluído com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir produtor:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir produtor. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedProdutor(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    
    { id: 'nome', label: 'Nome', minWidth: 170 },
    { id: 'cidade', label: 'Cidade', minWidth: 150 },
    
    { 
      id: 'created_at', 
      label: 'Data de Cadastro', 
      minWidth: 170,
      format: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },

    { 
      id: 'email', 
      label: 'Email', 
      minWidth: 170
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Produtores
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProdutores}
            disabled={isLoading}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProdutor}
          >
            Novo Produtor
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={produtores}
        isLoading={isLoading}
        onView={handleViewProdutor}
        onEdit={handleEditProdutor}
        onDelete={handleDeleteClick}
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Produtor"
        message={`Tem certeza que deseja excluir o produtor ${selectedProdutor?.nome}? Esta ação não pode ser desfeita.`}
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

      <Tooltip title="Adicionar Produtor">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddProdutor}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default ProdutoresPage;