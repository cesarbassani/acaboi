// src/pages/propriedades/PropriedadeFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Resolver } from 'react-hook-form';
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
  Propriedade,
  PropriedadeInput,
  getPropriedade,
  createPropriedade,
  updatePropriedade,
  getProdutoresSelect,
  getClassificacoes
} from '../../services/propriedadeService';
import { useAuth } from '../../store/AuthContext';

interface FormData {
  id_produtor: number;
  nome: string;
  telefone: string;
  celular: string;
  endereco: string;
  localizacao: string;
  cidade: string;
  inscricao_estadual: string;
  classificacao: string;
}

const schema = yup.object({
  id_produtor: yup.number().required('Produtor é obrigatório'),
  nome: yup.string().required('Nome é obrigatório'),
  telefone: yup.string().default(''),
  celular: yup.string().default(''),
  endereco: yup.string().required('Endereço é obrigatório'),
  localizacao: yup.string().default(''),
  cidade: yup.string().required('Cidade é obrigatória'),
  inscricao_estadual: yup.string().default(''),
  classificacao: yup.string().required('Classificação é obrigatória'),
}).required();

const PropriedadeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const produtorIdParam = searchParams.get('produtorId');
  
  const isEditing = !!id && id !== 'novo';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [produtores, setProdutores] = useState<any[]>([]);
  const classificacoes = getClassificacoes();
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      id_produtor: 0,
      nome: '',
      telefone: '',
      celular: '',
      endereco: '',
      localizacao: '',
      cidade: '',
      inscricao_estadual: '',
      classificacao: '',
    }
  });
  
  const loadPropriedade = async (propriedadeId: number) => {
    setIsLoading(true);
    try {
      const data = await getPropriedade(propriedadeId);
      if (data) {
        setPropriedade(data);
        
        reset({
          id_produtor: data.id_produtor,
          nome: data.nome,
          telefone: data.telefone || '',
          celular: data.celular || '',
          endereco: data.endereco,
          localizacao: data.localizacao || '',
          cidade: data.cidade,
          inscricao_estadual: data.inscricao_estadual || '',
          classificacao: data.classificacao || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar propriedade:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados da propriedade. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProdutores = async () => {
    try {
      const data = await getProdutoresSelect();
      setProdutores(data);
    } catch (error) {
      console.error('Erro ao carregar produtores:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar produtores. Tente novamente.',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    loadProdutores();
    
    if (isEditing && id) {
      loadPropriedade(parseInt(id));
    } else if (produtorIdParam) {
      // Pré-selecionar o produtor se vindo da tela de detalhes do produtor
      setValue('id_produtor', parseInt(produtorIdParam));
    }
  }, [id, isEditing, produtorIdParam, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const propriedadeData: PropriedadeInput = {
        id_produtor: data.id_produtor,
        nome: data.nome,
        telefone: data.telefone,
        celular: data.celular,
        endereco: data.endereco,
        localizacao: data.localizacao,
        cidade: data.cidade,
        inscricao_estadual: data.inscricao_estadual,
        classificacao: data.classificacao,
      };

      if (isEditing && propriedade) {
        // Atualizar propriedade existente
        await updatePropriedade(propriedade.id, propriedadeData);
        
        setSnackbar({
          open: true,
          message: 'Propriedade atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar nova propriedade
        await createPropriedade(propriedadeData);
        
        setSnackbar({
          open: true,
          message: 'Propriedade criada com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar para a listagem após o sucesso
      setTimeout(() => {
        if (produtorIdParam) {
          navigate(`/produtores/${produtorIdParam}`);
        } else {
          navigate('/propriedades');
        }
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isEditing ? 'atualizar' : 'criar'} propriedade. Tente novamente.`,
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
          {isEditing ? 'Editar Propriedade' : 'Nova Propriedade'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (produtorIdParam) {
              navigate(`/produtores/${produtorIdParam}`);
            } else {
              navigate('/propriedades');
            }
          }}
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
                      label="Nome da Propriedade"
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
                  name="id_produtor"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.id_produtor} disabled={isSubmitting || !!produtorIdParam}>
                      <InputLabel id="produtor-label">Produtor</InputLabel>
                      <Select
                        {...field}
                        labelId="produtor-label"
                        label="Produtor"
                      >
                        {produtores.map((produtor) => (
                          <MenuItem key={produtor.id} value={produtor.id}>
                            {produtor.usuario?.name || produtor.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_produtor && (
                        <FormHelperText>{errors.id_produtor.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="telefone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telefone"
                      fullWidth
                      error={!!errors.telefone}
                      helperText={errors.telefone?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="celular"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Celular"
                      fullWidth
                      error={!!errors.celular}
                      helperText={errors.celular?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="inscricao_estadual"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Inscrição Estadual"
                      fullWidth
                      error={!!errors.inscricao_estadual}
                      helperText={errors.inscricao_estadual?.message}
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
                  name="localizacao"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Localização (Coordenadas)"
                      fullWidth
                      error={!!errors.localizacao}
                      helperText={errors.localizacao?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Classificação e Técnico Responsável
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="classificacao"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.classificacao} disabled={isSubmitting}>
                      <InputLabel id="classificacao-label">Classificação</InputLabel>
                      <Select
                        {...field}
                        labelId="classificacao-label"
                        label="Classificação"
                      >
                        {classificacoes.map((classificacao) => (
                          <MenuItem key={classificacao.value} value={classificacao.value}>
                            {classificacao.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.classificacao && (
                        <FormHelperText>{errors.classificacao.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (produtorIdParam) {
                    navigate(`/produtores/${produtorIdParam}`);
                  } else {
                    navigate('/propriedades');
                  }
                }}
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

export default PropriedadeFormPage;