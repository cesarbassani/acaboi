// src/pages/users/UserFormPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, Paper, Divider, CircularProgress, Snackbar, Alert } from '@mui/material';
import { createUser, getUserById, updateUser, User } from '../../services/userService';
import { useAuth } from '../../store/AuthContext';

type UserFormData = {
  name: string;
  email: string;
  type: string;
  active: boolean;
  password?: string;
  confirmPassword?: string;
};

const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const isNewUser = !id;
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    type: 'tecnico', // Default
    active: true,
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadUser = useCallback(async () => {
    if (!id) return;
  
    setIsLoading(true);
    try {
      const user = await getUserById(id);
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email,
          type: user.type,
          active: user.active,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do usuário. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Verificar se o usuário atual é um administrador
    if (currentUser?.user_metadata?.type !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    // Carregar dados do usuário se for edição
    if (!isNewUser) {
      loadUser();
    }
  }, [id, currentUser,  isNewUser, loadUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, active: e.target.checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.type) {
      newErrors.type = 'Selecione um perfil';
    }
    
    // Validar senha apenas para novos usuários
    if (isNewUser) {
      if (!formData.password) {
        newErrors.password = 'A senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirme a senha';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isNewUser) {
        // Criar novo usuário
        await createUser(formData.email, formData.password!, {
          name: formData.name,
          type: formData.type as User['type'],
          active: formData.active
        });
        
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualizar usuário existente
        await updateUser(id, {
          name: formData.name,
          type: formData.type as User['type'],
          active: formData.active
        });
        
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar após um breve delay
      setTimeout(() => {
        navigate('/usuarios');
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isNewUser ? 'criar' : 'atualizar'} usuário. Tente novamente.`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/usuarios');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Verificar se o usuário atual é um administrador
  if (currentUser?.user_metadata?.type !== 'admin') {
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          {isNewUser ? 'Novo Usuário' : 'Editar Usuário'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Informações Pessoais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              name="name"
              label="Nome"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isSubmitting}
            />
            
            <TextField
              name="email"
              label="E-mail"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting || !isNewUser} // E-mail não pode ser alterado em edição
            />
            
            <FormControl fullWidth>
              <InputLabel id="user-type-label">Perfil</InputLabel>
              <Select
                labelId="user-type-label"
                name="type"
                value={formData.type}
                onChange={handleSelectChange}
                label="Perfil"
                error={!!errors.type}
                disabled={isSubmitting}
              >
                <MenuItem value="admin">Gestor</MenuItem>
                <MenuItem value="tecnico">Técnico</MenuItem>
              </Select>
              {errors.type && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleSwitchChange}
                  disabled={isSubmitting}
                />
              }
              label="Usuário Ativo"
            />
            
            {isNewUser && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Dados de Acesso
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <TextField
                  name="password"
                  label="Senha"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={isSubmitting}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  name="confirmPassword"
                  label="Confirmar Senha"
                  type="password"
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={isSubmitting}
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : isNewUser ? 'Criar Usuário' : 'Salvar Alterações'}
            </Button>
          </Box>
        </form>
      </Paper>

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

export default UserFormPage;