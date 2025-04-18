import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Resolver } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Escala,
  EscalaInput,
  getEscalaAbate,
  createEscalaAbate,
  updateEscalaAbate,
  getFrigorificosSelect,
  getProtocolosSelect,
  getTiposServico,
  getCategoriasAnimais,
  getTiposNegociacao,
  getFormasPagamento,
  getTecnicos
} from '../../services/escalaService';
import { getProdutores } from '../../services/produtorService';
import { getPropriedadesByProdutor } from '../../services/propriedadeService';

interface FormData {
  tipo_servico: string;
  data_embarque: string;
  data_abate: string;
  id_frigorifico: number;
  quantidade: number;
  categoria: string;
  id_produtor: number;
  id_propriedade: number;
  municipio: string;
  id_protocolo: number | null;
  preco_arroba: number | null;
  preco_cabeca: number | null;
  tipo_negociacao: string;
  forma_pagamento: string;
  id_tecnico_negociador: number | null;
  id_tecnico_responsavel: number | null;
  observacoes: string | null;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const schema = yup.object({
  tipo_servico: yup.string().required('Tipo de serviço é obrigatório'),
  data_embarque: yup.string().required('Data de embarque é obrigatória'),
  data_abate: yup.string().required('Data de abate é obrigatória'),
  id_frigorifico: yup.number().required('Frigorífico é obrigatório'),
  quantidade: yup.number().required('Quantidade é obrigatória').positive('Deve ser um número positivo'),
  categoria: yup.string().required('Categoria é obrigatória'),
  id_produtor: yup.number().required('Produtor é obrigatório'),
  id_propriedade: yup.number().required('Propriedade é obrigatória'),
  municipio: yup.string().required('Município é obrigatório'),
  id_protocolo: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  preco_arroba: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  preco_cabeca: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  tipo_negociacao: yup.string().required('Tipo de negociação é obrigatório'),
  forma_pagamento: yup.string().required('Forma de pagamento é obrigatória'),
  id_tecnico_negociador: yup.number().nullable().transform((value) => (isNaN(value) ? null : value)),
  id_tecnico_responsavel: yup.number().nullable(),
  observacoes: yup.string().nullable(),
}).required();

const EscalaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const produtorIdParam = searchParams.get('produtorId');
  const propriedadeIdParam = searchParams.get('propriedadeId');
  
  const isEditing = !!id && id !== 'novo';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escala, setEscala] = useState<Escala | null>(null);
  const [produtores, setProdutores] = useState<any[]>([]);
  const [propriedades, setPropriedades] = useState<any[]>([]);
  const [frigorificos, setFrigorificos] = useState<any[]>([]);
  const [protocolos, setProtocolos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicosDisponiveis, setTecnicosDisponiveis] = useState<any[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState<number | null>(null);
  
  const tiposServico = getTiposServico();
  const categoriasAnimais = getCategoriasAnimais();
  const tiposNegociacao = getTiposNegociacao();
  const formasPagamento = getFormasPagamento();
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      tipo_servico: '',
      data_embarque: '',
      data_abate: '',
      id_frigorifico: 0,
      quantidade: 0,
      categoria: '',
      id_produtor: 0,
      id_propriedade: 0,
      municipio: '',
      id_protocolo: null,
      preco_arroba: null,
      preco_cabeca: null,
      tipo_negociacao: '',
      forma_pagamento: '',
      id_tecnico_negociador: null,
      id_tecnico_responsavel: null,
      observacoes: '',
    }
  });
  
  const produtorId = watch('id_produtor');

  const loadPropriedadesByProdutor = useCallback(async (produtorId: number) => {
    try {
      const data = await getPropriedadesByProdutor(produtorId);
      setPropriedades(data);
      
      // Se houver apenas uma propriedade, seleciona automaticamente
      if (data.length === 1) {
        setValue('id_propriedade', data[0].id);
        
        // Se o município não estiver preenchido, preenche com a cidade da propriedade
        if (!watch('municipio')) {
          setValue('municipio', data[0].cidade || '');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar propriedades do produtor:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar propriedades do produtor. Tente novamente.',
        severity: 'error'
      });
    }
  }, [
    // Dependências:
    setPropriedades, // Função de estado estável
    setValue,         // Função do react-hook-form (estável)
    watch,            // Função do react-hook-form (estável)
    setSnackbar       // Função de estado estável
  ]);
  
  useEffect(() => {
    if (produtorId && produtorId > 0) {
      loadPropriedadesByProdutor(produtorId);
    }
  }, [produtorId, loadPropriedadesByProdutor]);
  
  const loadEscalaAbate = useCallback(async  (escalaId: number) => {
    setIsLoading(true);
    try {
      const data = await getEscalaAbate(escalaId);
      if (data) {
        setEscala(data);
        
        // Converter datas ISO para o formato de input date
        const dataEmbarque = new Date(data.data_embarque).toISOString().split('T')[0];
        const dataAbate = new Date(data.data_abate).toISOString().split('T')[0];
        
        reset({
          tipo_servico: data.tipo_servico,
          data_embarque: dataEmbarque,
          data_abate: dataAbate,
          id_frigorifico: data.id_frigorifico,
          quantidade: data.quantidade,
          categoria: data.categoria,
          id_produtor: data.id_produtor,
          id_propriedade: data.id_propriedade,
          municipio: data.municipio,
          id_protocolo: data.id_protocolo,
          preco_arroba: data.preco_arroba,
          preco_cabeca: data.preco_cabeca,
          tipo_negociacao: data.tipo_negociacao,
          forma_pagamento: data.forma_pagamento,
          id_tecnico_negociador: data.id_tecnico_negociador,
          id_tecnico_responsavel: data.id_tecnico_responsavel,
          observacoes: data.observacoes,
        });
        
        // Carregar propriedades do produtor selecionado
        await loadPropriedadesByProdutor(data.id_produtor);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do agendamento. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    // Dependências:
    setEscala,                   // Função de estado estável
    reset,                       // Função do react-hook-form (estável)
    loadPropriedadesByProdutor,  // Deve estar memoizada com useCallback
    setIsLoading,                // Função de estado estável
    setSnackbar                  // Função de estado estável
  ]);

  const loadProdutores = async () => {
    try {
      const data = await getProdutores();
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

  const loadFrigorificos = async () => {
    try {
      const data = await getFrigorificosSelect();
      setFrigorificos(data);
    } catch (error) {
      console.error('Erro ao carregar frigoríficos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar frigoríficos. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const loadProtocolos = async () => {
    try {
      const data = await getProtocolosSelect();
      setProtocolos(data);
    } catch (error) {
      console.error('Erro ao carregar protocolos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar protocolos. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const loadTecnicos = async () => {
    try {
      const data = await getTecnicos(); // Usando getTecnicos em vez de getTecnicosSelect
      setTecnicos(data);
      setTecnicosDisponiveis(data);
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar técnicos. Tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleSelectTecnico = (tecnicoId: number) => {
    setValue('id_tecnico_responsavel', tecnicoId);
    setSelectedTecnico(tecnicoId);
  };

  useEffect(() => {
    loadProdutores();
    loadFrigorificos();
    loadProtocolos();
    loadTecnicos();
    
    if (isEditing && id) {
      loadEscalaAbate(parseInt(id));
    } else {
      // Pré-selecionar produtor e propriedade se vindo de outra tela
      if (produtorIdParam) {
        setValue('id_produtor', parseInt(produtorIdParam));
      }
      if (propriedadeIdParam) {
        setValue('id_propriedade', parseInt(propriedadeIdParam));
      }
    }
  }, [id, isEditing, produtorIdParam, loadEscalaAbate, propriedadeIdParam, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Converter datas para o formato ISO para armazenar no banco
      const dataEmbarqueISO = new Date(data.data_embarque).toISOString();
      const dataAbateISO = new Date(data.data_abate).toISOString();
      
      const escalaData: EscalaInput = {
        tipo_servico: data.tipo_servico,
        data_embarque: dataEmbarqueISO,
        data_abate: dataAbateISO,
        id_frigorifico: data.id_frigorifico,
        quantidade: data.quantidade,
        categoria: data.categoria,
        id_produtor: data.id_produtor,
        id_propriedade: data.id_propriedade,
        municipio: data.municipio,
        id_protocolo: data.id_protocolo,
        preco_arroba: data.preco_arroba,
        preco_cabeca: data.preco_cabeca,
        tipo_negociacao: data.tipo_negociacao,
        forma_pagamento: data.forma_pagamento,
        id_tecnico_negociador: data.id_tecnico_negociador,
        id_tecnico_responsavel: data.id_tecnico_responsavel,
        observacoes: data.observacoes,
      };

      if (isEditing && escala) {
        // Atualizar agendamento existente
        await updateEscalaAbate(escala.id, escalaData);
        
        setSnackbar({
          open: true,
          message: 'Agendamento atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        // Criar novo agendamento
        await createEscalaAbate(escalaData);
        
        setSnackbar({
          open: true,
          message: 'Agendamento criado com sucesso!',
          severity: 'success'
        });
      }
      
      // Redirecionar para a listagem após o sucesso
      setTimeout(() => {
        navigate('/escala');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      setSnackbar({
        open: true,
        message: `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento. Tente novamente.`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de máscara para entrada de valores monetários
  const NumericFormatCustom = React.forwardRef<any, CustomProps>(
    function NumericFormatCustom(props, ref) {
      const { onChange, ...other } = props;
  
      return (
        <NumericFormat
          {...other}
          getInputRef={ref}
          thousandSeparator="."
          decimalSeparator=","
          valueIsNumericString
          prefix="R$ "
          decimalScale={2}
          onValueChange={(values) => {
            onChange({
              target: {
                name: props.name,
                value: values.value,
              },
            });
          }}
        />
      );
    },
  );
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
          {isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/escala')}
        >
          Voltar
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 2 }}>
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
                      name="tipo_servico"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.tipo_servico} disabled={isSubmitting}>
                          <InputLabel id="tipo-servico-label">Tipo de Serviço</InputLabel>
                          <Select
                            {...field}
                            labelId="tipo-servico-label"
                            label="Tipo de Serviço"
                          >
                            {tiposServico.map((tipo) => (
                              <MenuItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.tipo_servico && (
                            <FormHelperText>{errors.tipo_servico.message}</FormHelperText>
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
                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="data_embarque"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Data de Embarque"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.data_embarque}
                          helperText={errors.data_embarque?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="data_abate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Data de Abate"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.data_abate}
                          helperText={errors.data_abate?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="id_protocolo"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.id_protocolo} disabled={isSubmitting}>
                          <InputLabel id="protocolo-label">Protocolo</InputLabel>
                          <Select
                            {...field}
                            labelId="protocolo-label"
                            label="Protocolo"
                            value={field.value || ''}
                          >
                            <MenuItem value="">Nenhum protocolo</MenuItem>
                            {protocolos.map((protocolo) => (
                              <MenuItem key={protocolo.id} value={protocolo.id}>
                                {protocolo.nome}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.id_protocolo && (
                            <FormHelperText>{errors.id_protocolo.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
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
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="categoria"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.categoria} disabled={isSubmitting}>
                          <InputLabel id="categoria-label">Categoria</InputLabel>
                          <Select
                            {...field}
                            labelId="categoria-label"
                            label="Categoria"
                          >
                            {categoriasAnimais.map((categoria) => (
                              <MenuItem key={categoria.value} value={categoria.value}>
                                {categoria.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.categoria && (
                            <FormHelperText>{errors.categoria.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="municipio"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Município"
                          fullWidth
                          error={!!errors.municipio}
                          helperText={errors.municipio?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Produtor e Propriedade
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
                                {produtor.nome}
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
                      name="id_propriedade"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.id_propriedade} disabled={isSubmitting}>
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
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Negociação
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 2 }} />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="tipo_negociacao"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.tipo_negociacao} disabled={isSubmitting}>
                          <InputLabel id="tipo-negociacao-label">Tipo de Negociação</InputLabel>
                          <Select
                            {...field}
                            labelId="tipo-negociacao-label"
                            label="Tipo de Negociação"
                          >
                            {tiposNegociacao.map((tipo) => (
                              <MenuItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.tipo_negociacao && (
                            <FormHelperText>{errors.tipo_negociacao.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="forma_pagamento"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.forma_pagamento} disabled={isSubmitting}>
                          <InputLabel id="forma-pagamento-label">Forma de Pagamento</InputLabel>
                          <Select
                            {...field}
                            labelId="forma-pagamento-label"
                            label="Forma de Pagamento"
                          >
                            {formasPagamento.map((forma) => (
                              <MenuItem key={forma.value} value={forma.value}>
                                {forma.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.forma_pagamento && (
                            <FormHelperText>{errors.forma_pagamento.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '30%' } }}>
                    <Controller
                      name="id_tecnico_negociador"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.id_tecnico_negociador} disabled={isSubmitting}>
                          <InputLabel id="tecnico-negociador-label">Técnico Negociador</InputLabel>
                          <Select
                            {...field}
                            labelId="tecnico-negociador-label"
                            label="Técnico Negociador"
                            value={field.value || ''}
                          >
                            <MenuItem value="">Nenhum técnico</MenuItem>
                            {tecnicos.map((tecnico) => (
                              <MenuItem key={tecnico.id} value={tecnico.id}>
                                {tecnico.usuario?.name || tecnico.empresa}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.id_tecnico_negociador && (
                            <FormHelperText>{errors.id_tecnico_negociador.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                  <Controller
                    name="preco_arroba"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Preço por Arroba (R$)"
                        fullWidth
                        error={!!errors.preco_arroba}
                        helperText={errors.preco_arroba?.message}
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: <AttachMoneyIcon fontSize="small" sx={{ color: 'action.active', mr: 1 }} />,
                          inputComponent: NumericFormatCustom as any
                        }}
                      />
                    )}
                  />
                  </Box>

                  <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '47%' } }}>
                  <Controller
                      name="preco_cabeca"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Preço por Cabeça (R$)"
                          fullWidth
                          error={!!errors.preco_cabeca}
                          helperText={errors.preco_cabeca?.message}
                          disabled={isSubmitting}
                          InputProps={{
                            startAdornment: <AttachMoneyIcon fontSize="small" sx={{ color: 'action.active', mr: 1 }} />,
                            inputComponent: NumericFormatCustom as any
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                <Box>
                  <Controller
                    name="observacoes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Observações"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.observacoes}
                        helperText={errors.observacoes?.message}
                        disabled={isSubmitting}
                        placeholder="Adicione informações relevantes sobre o abate..."
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/escala')}
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
                    {isSubmitting ? 'Salvando...' : 'Agendar Abate'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Técnicos Disponíveis
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {tecnicos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum técnico disponível no momento.
                </Typography>
              ) : (
                <List>
                  {tecnicosDisponiveis.map((tecnico) => (
                    <ListItem 
                      key={tecnico.id} 
                      disablePadding
                      secondaryAction={
                        <Button
                          size="small"
                          variant={selectedTecnico === tecnico.id ? 'contained' : 'outlined'}
                          onClick={() => handleSelectTecnico(tecnico.id)}
                        >
                          {selectedTecnico === tecnico.id ? 'Selecionado' : 'Selecionar'}
                        </Button>
                      }
                    >
                      <ListItemButton onClick={() => handleSelectTecnico(tecnico.id)}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: selectedTecnico === tecnico.id ? 'primary.main' : 'grey.400' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={tecnico.usuario?.name || tecnico.empresa} 
                          secondary="Técnico disponível"
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

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

export default EscalaFormPage;