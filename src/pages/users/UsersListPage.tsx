// src/pages/users/UsersListPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip, IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  LockReset as LockResetIcon, 
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getUsers, toggleUserStatus, User } from '../../services/userService';
import { useAuth } from '../../store/AuthContext';
import ResetPasswordDialog from '../../pages/users/ResetPasswordDialog';

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar a lista de usuários. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    navigate('/usuarios/novo');
  };

  const handleEditUser = (id: string) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(id, !currentStatus);
      loadUsers(); // Recarrega a lista
      setSnackbar({
        open: true,
        message: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao alterar status do usuário. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleResetPassword = (id: string) => {
    setSelectedUserId(id);
    setResetPasswordOpen(true);
  };

  const handleCloseResetPassword = () => {
    setResetPasswordOpen(false);
    setSelectedUserId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'produtor': return 'Produtor';
      case 'frigorifico': return 'Frigorífico';
      case 'tecnico': return 'Técnico';
      default: return 'Desconhecido';
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'error';
      case 'produtor': return 'success';
      case 'frigorifico': return 'primary';
      case 'tecnico': return 'warning';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 250 },
    { field: 'email', headerName: 'E-mail', width: 250 },
    { 
      field: 'type', 
      headerName: 'Perfil', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={getUserTypeLabel(params.value as string)} 
          color={getUserTypeColor(params.value as string) as any}
          size="small"
        />
      )
    },
    { 
      field: 'active', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Ativo' : 'Inativo'} 
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'actions', 
      headerName: 'Ações', 
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => handleEditUser(params.row.id)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Redefinir senha">
            <IconButton 
              size="small" 
              onClick={() => handleResetPassword(params.row.id)}
              color="warning"
            >
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={params.row.active ? 'Desativar' : 'Ativar'}>
            <IconButton 
              size="small" 
              onClick={() => handleToggleStatus(params.row.id, params.row.active)}
              color={params.row.active ? 'error' : 'success'}
            >
              {params.row.active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Verificar se o usuário atual é um administrador
  if (currentUser?.role !== 'admin') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Acesso Restrito
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Você não tem permissão para acessar esta página. Esta área é restrita aos administradores.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Gerenciamento de Usuários
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Novo Usuário
        </Button>
      </Box>

      <Paper sx={{ p: 0, height: 'calc(100vh - 220px)', width: '100%' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={users}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        )}
      </Paper>

      {/* Diálogo de redefinição de senha */}
      <ResetPasswordDialog
        open={resetPasswordOpen}
        userId={selectedUserId}
        onClose={handleCloseResetPassword}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: 'Senha redefinida com sucesso!',
            severity: 'success'
          });
        }}
      />

      {/* Snackbar para mensagens */}
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

export default UsersListPage;