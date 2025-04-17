// src/pages/abates/AbateFormPage.tsx
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
  Stack,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Resolver } from 'react-hook-form';
import {
  Abate,
  AbateInput,
  getAbate,
  createAbate,
  updateAbate,
  getProdutoresSelect,
  getFrigorificosSelect,
  getCategoriasSelect,
  getPropriedadesByProdutor
} from '../../services/abateService';

interface FormData {
  id_produtor: number;
  id_frigorifico: number;
  id_categoria_animal: number;
  id_propriedade: number;
  nome_lote: string;
  data_abate: Date;
  quantidade: number;
  valor_arroba_negociada: number;
  valor_arroba_prazo_ou_vista: number;
  trace: boolean;
  hilton: boolean;
  desconto: number;
  novilho_precoce: boolean;
  dias_cocho: number;
  reembolso: number;
  carcacas_avaliadas: number;
  valor_total_acerto: number;
  observacao: string;
}

const schema = yup.object({
  id_produtor: yup.number().required('Produtor é obrigatório'),
  id_frigorifico: yup.number().required('Frigorífico é obrigatório'),
  id_categoria_animal: yup.number().required('Categoria é obrigatória'),
  id_propriedade: yup.number().required('Propriedade é obrigatória'),
  nome_lote: yup.string().required('Nome do lote é obrigatório'),
  data_abate: yup.date().required('Data do abate é obrigatória'),
  quantidade: yup.number().required('Quantidade é obrigatória').min(1, 'Quantidade deve ser maior que zero'),
  valor_arroba_negociada: yup.number().required('Valor da arroba é obrigatório').min(0, 'Valor deve ser maior ou igual a zero'),
  valor_arroba_prazo_ou_vista: yup.number().required('Valor da arroba prazo/vista é obrigatório').min(0, 'Valor deve ser maior ou igual a zero'),
  trace: yup.boolean(),
  hilton: yup.boolean(),
  desconto: yup.number().default(0),
  novilho_precoce: yup.boolean(),
  dias_cocho: yup.number().default(0),
  reembolso: yup.number().default(0),
  carcacas_avaliadas: yup.number().default(0),
  valor_total_acerto: yup.number().required('Valor total é obrigatório').min(0, 'Valor deve ser maior ou igual a zero'),
  observacao: yup.string(),
});

// Função auxiliar para formatar data para o campo input
const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const AbateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'novo';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [abate, setAbate] = useState<Abate | null>(null);
  const [produtores, setProdutores] = useState<any[]>([]);
  const [frigorificos, setFrigorificos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [propriedades, setPropriedades] = useState<any[]>([]);
  const [selectedProdutor, setSelectedProdutor] = useState<number | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      id_produtor: 0,
      id_frigorifico: 0,
      id_categoria_animal: 0,
      id_propriedade: 0,
      nome_lote: '',
      data_abate: new Date(),
      quantidade: 0,
      valor_arroba_negociada: 0,
      valor_arroba_prazo_ou_vista: 0,
      trace: false,
      hilton: false,
      desconto: 0,
      novilho_precoce: false,
      dias_cocho: 0,
      reembolso: 0,
      carcacas_avaliadas: 0,
      valor_total_acerto: 0,
      observacao: ''
    }
  });

  // Watch valores para cálculos dinâmicos
  const watchProdutor = watch('id_produtor');
  const watchQuantidade = watch('quantidade');
  const watchValorArroba = watch('valor_arroba_negociada');

  useEffect(() => {
    if (watchProdutor !== selectedProdutor && watchProdutor > 0) {
      setSelectedProdutor(watchProdutor);
      loadPropriedades(watchProdutor);
    }
  }, [watchProdutor]);

  useEffect(() => {
    // Cálculo simples do valor total
    if (watchQuantidade && watchValorArroba) {
      const valorTotal = watchQuantidade * watchValorArroba;
      setValue('valor_total_acerto', valorTotal);
    }
  }, [watchQuantidade, watchValorArroba, setValue]);

  const loadSelectOptions = async () => {
    try {
      const [produtoresData, frigorificosData, categoriasData] = await Promise.all([
        getProdutoresSelect(),
        getFrigorificosSelect(),
        getCategoriasSelect()
      ]);
      
      setProdutores(produtoresData);
      setFrigorificos(frigorificosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados de referência. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const loadPropriedades = async (produtorId: number) => {
    try {
      const data = await getPropriedadesByProdutor(produtorId);
      setPropriedades(data);
      
      // Se existir apenas uma propriedade, seleciona automaticamente
      if (data.length === 1) {
        setValue('id_propriedade', data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    }
  };

  const loadAbate = async (abateId: number) => {
    setIsLoading(true);
    try {
      const data = await getAbate(abateId);
      if (data) {
        setAbate(data);
        setSelectedProdutor(data.id_produtor);
        await loadPropriedades(data.id_produtor);
        
        reset({
          id_produtor: data.id_produtor,
          id_frigorifico: data.id_frigorifico,
          id_categoria_animal: data.id_categoria_animal,
          id_propriedade: data.id_propriedade,
          nome_lote: data.nome_lote,
          data_abate: new Date(data.data_abate),
          quantidade: data.quantidade,
          valor_arroba_negociada: data.valor_arroba_negociada,
          valor_arroba_prazo_ou_vista: data.valor_arroba_prazo_ou_vista,
          trace: data.trace,
          hilton: data.hilton,
          desconto: data.desconto,
          novilho_precoce: data.novilho_precoce,
          dias_cocho: data.dias_cocho,
          reembolso: data.reembolso,
          carcacas_avaliadas: data.carcacas_avaliadas,
          valor_total_acerto: data.valor_total_acerto,
          observacao: data.observacao || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar abate:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do abate. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSelectOptions();
    
    if (isEditing && id) {
      loadAbate(parseInt(id));
    }
  }, [id, isEditing]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const abateData: AbateInput = {
        id_produtor: data.id_produtor,
        id_frigorifico: data.id_frigorifico,
        id_categoria_animal: data.id_categoria_animal,
        id_propriedade: data.id_propriedade,
        nome_lote: data.nome_lote,
        data_abate: data.data_abate.toISOString().split('T')[0],
        quantidade: data.quantidade,
        valor_arroba_negociada: data.valor_arroba_negociada,
        valor_arroba_prazo_ou_vista: data.valor_arroba_prazo_ou_vista,
        trace: data.trace,
        hilton: data.hilton,
        desconto: data.desconto,
        novilho_precoce: data.novilho_precoce,
        dias_cocho: data.dias_cocho,
        reembolso: data.reembolso,
        carcacas_avaliadas: data.carcacas_avaliadas,
        valor_total_acerto: data.valor_total_acerto,
        observacao: data.observacao
      };

      if (isEditing && abate) {
        // Atualizar abate existente
        await updateAbate(abate.id, abateData);
        
        setSnackbar({
          open: true,
          message: 'Abate atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo abate
        await createAbate(abateData);
        
        setSnackbar({
          open: true,
          message: 'Abate registrado com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar após o sucesso
      setTimeout(() => {
        navigate('/abates');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar abate:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isEditing ? 'atualizar' : 'criar'} abate. Tente novamente.`,
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
          {isEditing ? 'Editar Abate' : 'Novo Abate'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/abates')}
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
                  name="id_produtor"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.id_produtor} disabled={isSubmitting}>
                      <InputLabel id="produtor-label">Produtor</InputLabel>
                      <Select
                        {...field}
                        labelId="produtor-label"
                        label="Produtor"
                      >
                        {produtores.map((produtor) => (
                          <MenuItem key={produtor.id} value={produtor.id}>
                            {produtor.nome || produtor.nome}
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
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="id_frigorifico"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.id_frigorifico} disabled={isSubmitting}>
                      <InputLabel id="frigorifico-label">Frigorífico</InputLabel>
                      <Select
                        {...field}
                        labelId="frigorifico-label"
                        label="Frigorífico"
                      >
                        {frigorificos.map((frigorifico) => (
                          <MenuItem key={frigorifico.id} value={frigorifico.id}>
                            {frigorifico.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_frigorifico && (
                        <FormHelperText>{errors.id_frigorifico.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="id_categoria_animal"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.id_categoria_animal} disabled={isSubmitting}>
                      <InputLabel id="categoria-label">Categoria</InputLabel>
                      <Select
                        {...field}
                        labelId="categoria-label"
                        label="Categoria"
                      >
                        {categorias.map((categoria) => (
                          <MenuItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_categoria_animal && (
                        <FormHelperText>{errors.id_categoria_animal.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="id_propriedade"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.id_propriedade} disabled={isSubmitting || propriedades.length === 0}>
                      <InputLabel id="propriedade-label">Propriedade</InputLabel>
                      <Select
                        {...field}
                        labelId="propriedade-label"
                        label="Propriedade"
                      >
                        {propriedades.map((propriedade) => (
                          <MenuItem key={propriedade.id} value={propriedade.id}>
                            {propriedade.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.id_propriedade && (
                        <FormHelperText>{errors.id_propriedade.message}</FormHelperText>
                      )}
                      {propriedades.length === 0 && !watchProdutor && (
                        <FormHelperText>Selecione um produtor primeiro</FormHelperText>
                      )}
                      {propriedades.length === 0 && watchProdutor > 0 && (
                        <FormHelperText>Nenhuma propriedade encontrada para este produtor</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="nome_lote"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome do Lote"
                      fullWidth
                      error={!!errors.nome_lote}
                      helperText={errors.nome_lote?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="data_abate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Data do Abate"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={formatDateForInput(field.value)}
                      onChange={(e) => {
                        field.onChange(e.target.value ? new Date(e.target.value) : null);
                      }}
                      error={!!errors.data_abate}
                      helperText={errors.data_abate?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Detalhes do Abate
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="quantidade"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantidade de Animais"
                      type="number"
                      fullWidth
                      error={!!errors.quantidade}
                      helperText={errors.quantidade?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="valor_arroba_negociada"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor da Arroba Negociada"
                      type="number"
                      fullWidth
                      error={!!errors.valor_arroba_negociada}
                      helperText={errors.valor_arroba_negociada?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="valor_arroba_prazo_ou_vista"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor Arroba Prazo/Vista"
                      type="number"
                      fullWidth
                      error={!!errors.valor_arroba_prazo_ou_vista}
                      helperText={errors.valor_arroba_prazo_ou_vista?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="valor_total_acerto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor Total do Acerto"
                      type="number"
                      fullWidth
                      error={!!errors.valor_total_acerto}
                      helperText={errors.valor_total_acerto?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                <Controller
                  name="carcacas_avaliadas"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Carcaças Avaliadas"
                      type="number"
                      fullWidth
                      error={!!errors.carcacas_avaliadas}
                      helperText={errors.carcacas_avaliadas?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="dias_cocho"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Dias de Cocho"
                      type="number"
                      fullWidth
                      error={!!errors.dias_cocho}
                      helperText={errors.dias_cocho?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="desconto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Desconto"
                      type="number"
                      fullWidth
                      error={!!errors.desconto}
                      helperText={errors.desconto?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Box>
 
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                <Controller
                  name="reembolso"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reembolso"
                      type="number"
                      fullWidth
                      error={!!errors.reembolso}
                      helperText={errors.reembolso?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
 
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Controller
                  name="trace"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      }
                      label="TRACE"
                    />
                  )}
                />
 
                <Controller
                  name="hilton"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      }
                      label="HILTON"
                    />
                  )}
                />
 
                <Controller
                  name="novilho_precoce"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      }
                      label="Novilho Precoce"
                    />
                  )}
                />
              </Box>
            </Box>
 
            <Box>
              <Controller
                name="observacao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.observacao}
                    helperText={errors.observacao?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Box>
 
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/abates')}
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
 
 export default AbateFormPage;