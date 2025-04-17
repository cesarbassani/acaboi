// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../store/AuthContext';
import { supabase } from '../services/supabase';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Carregar dados do usuário do Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setFormData(prev => ({
        ...prev,
        name: data?.name || user.user_metadata?.name || ''
      }));
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do perfil. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'A senha atual é obrigatória';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'A nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme a nova senha';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm() || !user?.id) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Atualizar dados de autenticação
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: formData.name
        }
      });
      
      if (authError) throw authError;
      
      // Atualizar perfil na tabela
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Atualizar o usuário no contexto
      await refreshUser();
      
      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar perfil. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: formData.currentPassword
      });
      
      if (signInError) {
        setErrors(prev => ({ ...prev, currentPassword: 'Senha atual incorreta' }));
        setIsSubmitting(false);
        return;
      }
      
      // Alterar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (updateError) throw updateError;
      
      // Resetar campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSnackbar({
        open: true,
        message: 'Senha alterada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao alterar senha. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
          Meu Perfil
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Informações do Perfil */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Informações Pessoais
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              label="E-mail"
              fullWidth
              value={user?.email || ''}
              disabled
              helperText="O e-mail não pode ser alterado"
            />
            
            <TextField
              label="Perfil"
              fullWidth
              value={user?.user_metadata?.type === 'admin' ? 'Administrador' : 
                    user?.user_metadata?.type === 'produtor' ? 'Produtor' : 
                    user?.user_metadata?.type === 'frigorifico' ? 'Frigorífico' : 
                    user?.user_metadata?.type === 'tecnico' ? 'Técnico' : 'Desconhecido'}
              disabled
              helperText="Para alterar seu perfil, contate um administrador"
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Atualizar Perfil'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Alteração de Senha */}
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Alterar Senha
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="currentPassword"
              label="Senha Atual"
              type="password"
              fullWidth
              value={formData.currentPassword}
              onChange={handleChange}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={isSubmitting}
            />
            
            <TextField
              name="newPassword"
              label="Nova Senha"
              type="password"
              fullWidth
              value={formData.newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              disabled={isSubmitting}
            />
            
            <TextField
              name="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isSubmitting}
            />
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Alterar Senha'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

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

export default ProfilePage;