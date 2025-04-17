// src/pages/produtores/ProdutorFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  Stack
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Produtor,
  ProdutorInput,
  getProdutor,
  createProdutor,
  updateProdutor,
} from '../../services/produtorService';

// Corrigir a tipagem para FormData - removida referência a id_usuario
interface FormData {
  nome: string;
  endereco: string;
  cidade: string;
  cnpj: string;
  marca_produtor: string;
  email?: string;
}

// Esquema de validação
const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
  cidade: yup.string().required('Cidade é obrigatória'),
  cnpj: yup.string().required('CNPJ é obrigatório'),
  marca_produtor: yup.string().required('Marca do produtor é obrigatória'),
  email: yup.string().email('Email inválido'),
}).required();

const ProdutorFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'novo';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [produtor, setProdutor] = useState<Produtor | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Configuração do useForm com resolver corrigido
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
      endereco: '',
      cidade: '',
      cnpj: '',
      marca_produtor: '',
      email: '',
    }
  });

  const loadProdutor = async (produtorId: number) => {
    setIsLoading(true);
    try {
      const data = await getProdutor(produtorId);
      if (data) {
        setProdutor(data);
        
        reset({
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj,
          marca_produtor: data.marca_produtor,
          email: data.email
        });
      }
    } catch (error) {
      console.error('Erro ao carregar produtor:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do produtor. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadProdutor(parseInt(id));
    }
  }, [id, isEditing]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && produtor) {
        // Atualizar produtor existente
        await updateProdutor(produtor.id, {
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj,
          marca_produtor: data.marca_produtor,
          email: data.email!,
        });
        
        setSnackbar({
          open: true,
          message: 'Produtor atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo produtor
        await createProdutor({
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          cnpj: data.cnpj,
          marca_produtor: data.marca_produtor,
          email: data.email!,
        });
        
        setSnackbar({
          open: true,
          message: 'Produtor criado com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar para a listagem após o sucesso
      setTimeout(() => {
        navigate('/produtores');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar produtor:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isEditing ? 'atualizar' : 'criar'} produtor. Tente novamente.`,
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
          {isEditing ? 'Editar Produtor' : 'Novo Produtor'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtores')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                      label="Nome do Produtor"
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

              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="marca_produtor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Marca do Produtor"
                      fullWidth
                      error={!!errors.marca_produtor}
                      helperText={errors.marca_produtor?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Informações da Conta
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
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
                      disabled={isSubmitting}
                      type="email"
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/produtores')}
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

export default ProdutorFormPage;