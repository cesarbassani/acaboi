import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Escala, getEscalaAbates, deleteEscalaAbate } from '../../services/escalaService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const EscalaListPage: React.FC = () => {
  const navigate = useNavigate();
  const [escalaAbates, setEscalaAbates] = useState<Escala[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [escalaToDelete, setEscalaToDelete] = useState<Escala | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadEscalaAbates = async () => {
    setIsLoading(true);
    try {
      const data = await getEscalaAbates();
      setEscalaAbates(data);
    } catch (error) {
      console.error('Erro ao carregar escala de abates:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar escala de abates. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEscalaAbates();
  }, []);

  const handleOpenDeleteDialog = (escala: Escala) => {
    setEscalaToDelete(escala);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!escalaToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEscalaAbate(escalaToDelete.id);
      setSnackbar({
        open: true,
        message: 'Agendamento excluído com sucesso!',
        severity: 'success'
      });
      await loadEscalaAbates();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir agendamento. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Escala de Abates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadEscalaAbates}
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/escala/novo')}
          >
            Novo Agendamento
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell  sx={{ fontWeight: 'bold' }}>Tipo de Serviço</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Data Embarque</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Data Abate</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Frigorífico</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Produtor</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Propriedade</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Município</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Protocolo</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Preço/@</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Preço/Cab</TableCell>
                <TableCell  sx={{ fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escalaAbates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                escalaAbates.map((escala) => (
                  <TableRow key={escala.id}>
                    <TableCell>{escala.tipo_servico}</TableCell>
                    <TableCell>{formatDate(escala.data_embarque)}</TableCell>
                    <TableCell>{formatDate(escala.data_abate)}</TableCell>
                    <TableCell>{escala.frigorifico?.nome}</TableCell>
                    <TableCell>{escala.quantidade}</TableCell>
                    <TableCell>{escala.categoria}</TableCell>
                    <TableCell>{escala.produtor?.nome}</TableCell>
                    <TableCell>{escala.propriedade?.nome}</TableCell>
                    <TableCell>{escala.municipio || escala.propriedade?.cidade}</TableCell>
                    <TableCell>
                      {escala.protocolo?.nome && (
                        <Chip label={escala.protocolo.nome} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(escala.preco_arroba)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(escala.preco_cabeca)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Visualizar">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/escala/${escala.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/escala/editar/${escala.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(escala)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento de ${escalaToDelete?.quantidade || ''} ${escalaToDelete?.categoria || 'animais'} para ${escalaToDelete?.frigorifico?.nome || ''}? Esta ação não pode ser desfeita.`}
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
    </Box>
  );
};

export default EscalaListPage;