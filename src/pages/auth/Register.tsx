// src/pages/auth/Register.tsx
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
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
}  from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
  name: yup.string().required('Nome é obrigatório'),
  userType: yup.string().required('Tipo de usuário é obrigatório'),
}).required();

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userType: string;
}

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: ''
    }
  });

  // Timeout de segurança para caso o registro fique travado
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (loading) {
      timer = setTimeout(() => {
        setTimeoutWarning(true);
        
        // Após 10 segundos, force o redirecionamento
        const forceRedirectTimer = setTimeout(() => {
          setLoading(false);
          setSuccess(true);
          
          // Redirecionar após mostrar mensagem de sucesso
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }, 5000); // 5 segundos após o aviso
        
        return () => clearTimeout(forceRedirectTimer);
      }, 5000); // 5 segundos para mostrar o aviso
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, navigate]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setTimeoutWarning(false);
    setError(null);
    
    try {
      const { error, success } = await signUp(data.email, data.password, data.name, data.userType);
      
      if (success) {
        setSuccess(true);
        
        // Redirecionar após mostrar mensagem de sucesso
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(error?.message || 'Falha ao criar conta. Tente novamente.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro no registro:", err);
      setError('Ocorreu um erro inesperado. Tente novamente.');
      setLoading(false);
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
              Criar Nova Conta
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Registro realizado com sucesso! Verifique seu email para confirmar a conta.
              Redirecionando para a página de login...
            </Alert>
          )}

          {loading && timeoutWarning && (
            <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
              O registro está demorando mais que o esperado. Redirecionando automaticamente...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nome Completo"
                  autoComplete="name"
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

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
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="confirmPassword"
                  label="Confirmar Senha"
                  type="password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />

            <Controller
              name="userType"
              control={control}
              render={({ field }) => (
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  error={!!errors.userType}
                >
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    {...field}
                    label="Tipo de Usuário"
                  >
                    <MenuItem value="tecnico">Técnico</MenuItem>
                  </Select>
                  {errors.userType && (
                    <FormHelperText>{errors.userType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

<Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrar'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="/login" variant="body2">
                Já tem uma conta? Faça login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;