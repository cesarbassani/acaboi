// src/components/users/ResetPasswordDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { resetUserPassword } from '../../services/userService';

interface ResetPasswordDialogProps {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, userId, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    // Validações
    if (!password) {
      setError('A senha é obrigatória');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!userId) {
      setError('Usuário não selecionado');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await resetUserPassword(userId, password);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setError('Falha ao redefinir a senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Redefinir Senha do Usuário</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Digite a nova senha para o usuário. A senha deve ter pelo menos 6 caracteres.
        </Typography>
        
        <TextField
          label="Nova Senha"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          error={!!error && password.length === 0}
          helperText={!!error && password.length === 0 ? 'A senha é obrigatória' : ''}
        />
        
        <TextField
          label="Confirmar Senha"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          error={!!error && (confirmPassword.length === 0 || password !== confirmPassword)}
          helperText={
            !!error && confirmPassword.length === 0 
              ? 'Confirme a senha' 
              : !!error && password !== confirmPassword 
                ? 'As senhas não coincidem' 
                : ''
          }
        />

        {error && error !== 'A senha é obrigatória' && error !== 'As senhas não coincidem' && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button 
          onClick={handleResetPassword} 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Redefinir Senha'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;