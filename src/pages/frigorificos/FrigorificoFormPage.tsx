// src/pages/frigorificos/FrigorificoFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  Stack
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Frigorifico,
  FrigorificoInput,
  getFrigorifico,
  createFrigorifico,
  updateFrigorifico
} from '../../services/frigorificoService';
import { supabase } from '../../services/supabase';
import { Resolver } from 'react-hook-form';

interface FormData {
  nome: string;
  endereco: string;
  cidade: string;
  cnpj: string;
  email: string;
}

// Corrigido o schema para remover a obrigatoriedade do email
const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
  cidade: yup.string().required('Cidade é obrigatória'),
  cnpj: yup.string().required('CNPJ é obrigatório'),
  email: yup.string().email('Email inválido'), // Removido o .required()
});

const FrigorificoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Verificação mais explícita
  const isEditing = id !== undefined && id !== null && id !== 'novo';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frigorifico, setFrigorifico] = useState<Frigorifico | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      nome: '',
      endereco: '',
      cidade: '',
      cnpj: '',
      email: ''
    }
  });

  // Log de erros de validação
  useEffect(() => {
    console.log("Erros de validação:", errors);
  }, [errors]);

  const loadFrigorifico = async (frigorificoId: number) => {
    setIsLoading(true);
    try {
      const data = await getFrigorifico(frigorificoId);
      if (data) {
        setFrigorifico(data);
        
        // Buscar o email do usuário
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .single();
        
        reset({
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj,
          email: userData?.email || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar frigorífico:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do frigorífico. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("ID do parâmetro:", id);
    console.log("isEditing:", isEditing);
    
    if (isEditing && id) {
      loadFrigorifico(parseInt(id));
    }
  }, [id, isEditing]);

  // Função de debug para o submit
  const handleFormSubmit = (data: FormData) => {
    console.log("Formulário submetido", data);
    onSubmit(data);
  };

  const onSubmit = async (data: FormData) => {
    console.log("Iniciando submissão com dados:", data);
    setIsSubmitting(true);
    
    try {
      if (isEditing && frigorifico) {
        // Atualizar frigorífico existente
        console.log("Atualizando frigorífico existente");
        await updateFrigorifico(frigorifico.id, {
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj,
        });
        
        setSnackbar({
          open: true,
          message: 'Frigorífico atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo frigorífico diretamente
        console.log("Criando novo frigorífico");
        await createFrigorifico({
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj
        });
        
        setSnackbar({
          open: true,
          message: 'Frigorífico criado com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar para a listagem após o sucesso
      setTimeout(() => {
        navigate('/frigorificos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar frigorífico:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isEditing ? 'atualizar' : 'criar'} frigorífico. Tente novamente.`,
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
          {isEditing ? 'Editar Frigorífico' : 'Novo Frigorífico'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/frigorificos')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Informações Básicas
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome"
                      fullWidth
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="cnpj"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CNPJ"
                      fullWidth
                      error={!!errors.cnpj}
                      helperText={errors.cnpj?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box>
              <Controller
                name="endereco"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Endereço"
                    fullWidth
                    error={!!errors.endereco}
                    helperText={errors.endereco?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="cidade"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cidade"
                      fullWidth
                      error={!!errors.cidade}
                      helperText={errors.cidade?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Campo de email comentado mas mantido no código */}
            {/* <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Informações de Conta
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>

            <Box>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isSubmitting || isEditing}
                    type="email"
                  />
                )}
              />
            </Box> */}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/frigorificos')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

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

export default FrigorificoFormPage;