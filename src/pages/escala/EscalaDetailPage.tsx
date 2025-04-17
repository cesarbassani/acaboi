import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Escala, getEscalaAbate, deleteEscalaAbate } from '../../services/escalaService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const EscalaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [escala, setEscala] = useState<Escala | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadEscalaAbate = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getEscalaAbate(parseInt(id));
      if (data) {
        setEscala(data);
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
  };

  useEffect(() => {
    loadEscalaAbate();
  }, [id]);

  const handleEdit = () => {
    navigate(`/escala/editar/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteEscalaAbate(parseInt(id));
      setSnackbar({
        open: true,
        message: 'Agendamento excluído com sucesso!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/escala');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir agendamento. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!escala) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Agendamento não encontrado
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/escala')}
          sx={{ mt: 2 }}
        >
          Voltar para Lista
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={600}>
            Detalhes do Agendamento
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/escala')}
          >
            Voltar
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Tipo de Serviço: {escala.tipo_servico}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Data de Embarque: {formatDate(escala.data_embarque)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventNoteIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Data de Abate: {formatDate(escala.data_abate)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Frigorífico: {escala.frigorifico?.nome || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Quantidade: {escala.quantidade} {escala.categoria}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Município: {escala.municipio || '-'}
                  </Typography>
                </Box>
                
                {escala.protocolo && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Protocolo: <Chip label={escala.protocolo.nome} size="small" />
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Produtor e Propriedade
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Produtor: {escala.produtor?.nome || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Propriedade: {escala.propriedade?.nome || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
                    Negociação
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Tipo de Negociação: {escala.tipo_negociacao || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Forma de Pagamento: {escala.forma_pagamento || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Preço por Arroba: {formatCurrency(escala.preco_arroba)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Preço por Cabeça: {formatCurrency(escala.preco_cabeca)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Técnicos Responsáveis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Técnico Negociador
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {escala.tecnico_negociador ? 
                        (escala.tecnico_negociador.usuario?.name || escala.tecnico_negociador.empresa) 
                        : 'Nenhum técnico negociador designado'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Técnico Responsável
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {escala.tecnico_responsavel ? 
                        (escala.tecnico_responsavel.usuario?.name || escala.tecnico_responsavel.empresa) 
                        : 'Nenhum técnico responsável designado'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
            
            {escala.observacoes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Observações
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {escala.observacoes}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento de ${escala.quantidade} ${escala.categoria} para ${escala.frigorifico?.nome || ''}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        isLoading={isDeleting}
        severity="error"
      />

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

export default EscalaDetailPage;