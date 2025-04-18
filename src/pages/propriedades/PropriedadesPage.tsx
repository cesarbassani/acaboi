// src/pages/propriedades/PropriedadesPage.tsx
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DataTable } from '../../components/DataTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Propriedade, getPropriedades, deletePropriedade } from '../../services/propriedadeService';
import { useAuth } from '../../store/AuthContext';

const PropriedadesPage: React.FC = () => {
  const navigate = useNavigate();
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPropriedade, setSelectedPropriedade] = useState<Propriedade | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadPropriedades = async () => {
    setIsLoading(true);
    try {
      const data = await getPropriedades();
      setPropriedades(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar propriedades. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPropriedades();
  }, []);

  const handleAddPropriedade = () => {
    navigate('/propriedades/novo');
  };

  const handleEditPropriedade = (propriedade: Propriedade) => {
    navigate(`/propriedades/editar/${propriedade.id}`);
  };

  const handleViewPropriedade = (propriedade: Propriedade) => {
    navigate(`/propriedades/${propriedade.id}`);
  };

  const handleDeleteClick = (propriedade: Propriedade) => {
    setSelectedPropriedade(propriedade);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPropriedade) return;
    
    setIsDeleting(true);
    try {
      await deletePropriedade(selectedPropriedade.id);
      setPropriedades(propriedades.filter(p => p.id !== selectedPropriedade.id));
      setSnackbar({
        open: true,
        message: 'Propriedade excluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir propriedade. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedPropriedade(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 70 },
    { id: 'nome', label: 'Nome', minWidth: 170 },
    { 
      id: 'produtor', 
      label: 'Produtor',
      minWidth: 170,
      format: (value: any) => value?.nome || 'N/A'
    },
    { id: 'cidade', label: 'Cidade', minWidth: 150 },
    { 
      id: 'classificacao', 
      label: 'Classificação', 
      minWidth: 120,
      format: (value: string) => {
        const classificacoes: {[key: string]: {label: string, color: string}} = {
          'A': { label: 'A - Premium', color: 'success' },
          'B': { label: 'B - Padrão', color: 'primary' },
          'C': { label: 'C - Básica', color: 'default' }
        };
        
        const classificacao = classificacoes[value] || { label: value || 'N/A', color: 'default' };
        
        return (
          <Chip 
            label={classificacao.label} 
            color={classificacao.color as any} 
            size="small" 
          />
        );
      }
    },
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
          Propriedades
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadPropriedades}
            disabled={isLoading}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPropriedade}
          >
            Nova Propriedade
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={propriedades}
        isLoading={isLoading}
        onView={handleViewPropriedade}
        onEdit={handleEditPropriedade}
        onDelete={handleDeleteClick}
        getRowId={(row) => row.id}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Propriedade"
        message={`Tem certeza que deseja excluir a propriedade ${selectedPropriedade?.nome}? Esta ação não pode ser desfeita.`}
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

      <Tooltip title="Adicionar Propriedade">
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddPropriedade}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default PropriedadesPage;