// src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
}).required();

type FormData = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const { signIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  // Timeout de segurança para caso o login fique travado
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (localLoading) {
      timer = setTimeout(() => {
        setTimeoutWarning(true);
        
        // Após 10 segundos, force o redirecionamento
        const forceRedirectTimer = setTimeout(() => {
          setLocalLoading(false);
          navigate('/dashboard');
        }, 5000); // 5 segundos após o aviso
        
        return () => clearTimeout(forceRedirectTimer);
      }, 5000); // 5 segundos para mostrar o aviso
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [localLoading, navigate]);

  const onSubmit = async (data: FormData) => {
    setLocalLoading(true);
    setTimeoutWarning(false);
    setError(null);
    
    try {
      const { error, success, redirectTo } = await signIn(data.email, data.password);
      
      if (success) {
        // Adicionamos um pequeno delay antes de redirecionar
        setTimeout(() => {
          navigate(redirectTo || '/dashboard');
        }, 1000);
      } else {
        setError(error?.message || 'Falha ao fazer login. Verifique suas credenciais.');
        setLocalLoading(false);
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
      setLocalLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mt: 8 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight={700} color="primary">
              ACABOI
            </Typography>
            <Typography component="h2" variant="h5" fontWeight={500} color="text.secondary">
              Sistema de Gestão de Abates
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {(localLoading || authLoading) && timeoutWarning && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              O login está demorando mais que o esperado. Redirecionando automaticamente...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="password"
                  label="Senha"
                  type="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={localLoading || authLoading}
            >
              {(localLoading || authLoading) ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link href="/forgot-password" variant="body2">
                Esqueceu a senha?
              </Link>
              <Link href="/register" variant="body2">
                Não tem uma conta? Registre-se
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;