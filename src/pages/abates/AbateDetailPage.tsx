// src/pages/abates/AbateDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  DateRange as DateRangeIcon,
  BusinessCenter as BusinessCenterIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  LocalOffer as LocalOfferIcon,
  AttachMoney as AttachMoneyIcon,
  Bookmark as BookmarkIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { Abate, getAbate, deleteAbate } from '../../services/abateService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const AbateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [abate, setAbate] = useState<Abate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadAbate = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getAbate(parseInt(id));
      if (data) {
        setAbate(data);
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
    loadAbate();
  }, [id]);

  const handleEdit = () => {
    navigate(`/abates/editar/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteAbate(parseInt(id));
      setSnackbar({
        open: true,
        message: 'Abate excluído com sucesso!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/abates');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir abate:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir abate. Tente novamente.',
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!abate) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Abate não encontrado
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/abates')}
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
            Abate #{abate.id} - {abate.nome_lote}
          </Typography>
          {abate.trace && (
            <Chip 
              label="TRACE" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
          {abate.hilton && (
            <Chip 
              label="HILTON" 
              color="info" 
              size="small" 
              sx={{ ml: 1 }} 
            />
          )}
          {abate.novilho_precoce && (
            <Chip 
              label="NOVILHO PRECOCE" 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/abates')}
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '48%' } }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Data do Abate: {format(new Date(abate.data_abate), 'dd/MM/yyyy', { locale: ptBR })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Produtor: {abate.produtor?.usuario?.name || abate.produtor?.nome || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessCenterIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Frigorífico: {abate.frigorifico?.nome || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Propriedade: {abate.propriedade?.nome || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Categoria: {abate.categoriaAnimal?.nome || 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Lote: {abate.nome_lote}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '48%' } }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Detalhes Financeiros
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Valor Arroba Negociada: {formatCurrency(abate.valor_arroba_negociada)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Valor Arroba Prazo/Vista: {formatCurrency(abate.valor_arroba_prazo_ou_vista)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BookmarkIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Quantidade de Animais: {abate.quantidade}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUserIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Carcaças Avaliadas: {abate.carcacas_avaliadas}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Desconto: {formatCurrency(abate.desconto || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Reembolso: {formatCurrency(abate.reembolso || 0)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    Valor Total: {formatCurrency(abate.valor_total_acerto)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '100%', mt: 1 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Informações Adicionais
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Características
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Dias de Cocho: ${abate.dias_cocho}`}
                      variant="outlined" 
                      size="small" 
                    />
                    {abate.trace && (
                      <Chip 
                        label="TRACE" 
                        color="success" 
                        size="small" 
                      />
                    )}
                    {abate.hilton && (
                      <Chip 
                        label="HILTON" 
                        color="info" 
                        size="small" 
                      />
                    )}
                    {abate.novilho_precoce && (
                      <Chip 
                        label="NOVILHO PRECOCE" 
                        color="primary" 
                        size="small" 
                      />
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Observações
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {abate.observacao ? (
                      <Typography variant="body2">{abate.observacao}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma observação registrada.
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Datas
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Cadastro:</strong> {format(new Date(abate.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Última atualização:</strong> {format(new Date(abate.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Abate"
        message={`Tem certeza que deseja excluir o abate #${abate.id} do lote ${abate.nome_lote}? Esta ação não pode ser desfeita.`}
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

export default AbateDetailPage;