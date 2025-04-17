// src/pages/propriedades/PropriedadeDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Domain as DomainIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { Propriedade, getPropriedade, deletePropriedade, getClassificacoes } from '../../services/propriedadeService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const PropriedadeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const classificacoes = getClassificacoes().reduce((acc, curr) => {
    acc[curr.value] = curr.label;
    return acc;
  }, {} as {[key: string]: string});

  const loadPropriedade = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getPropriedade(parseInt(id));
      if (data) {
        setPropriedade(data);
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

  useEffect(() => {
    loadPropriedade();
  }, [id]);

  const handleEdit = () => {
    navigate(`/propriedades/editar/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deletePropriedade(parseInt(id));
      setSnackbar({
        open: true,
        message: 'Propriedade excluída com sucesso!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/propriedades');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir propriedade. Tente novamente.',
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

  const getClassificacaoColor = (classificacao: string) => {
    const colors: {[key: string]: string} = {
      'A': 'success',
      'B': 'primary',
      'C': 'default'
    };
    return colors[classificacao] || 'default';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!propriedade) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Propriedade não encontrada
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/propriedades')}
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
            {propriedade.nome}
          </Typography>
          <Chip 
            label={classificacoes[propriedade.classificacao] || propriedade.classificacao} 
            color={getClassificacaoColor(propriedade.classificacao) as any} 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/propriedades')}
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

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '48%' } }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informações Básicas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DomainIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    {propriedade.nome}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Produtor: {propriedade.produtor?.nome}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {propriedade.endereco}, {propriedade.cidade}
                  </Typography>
                </Box>
                
                {propriedade.localizacao && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Coordenadas: {propriedade.localizacao}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '48%' } }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Contato e Registro
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {propriedade.telefone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Telefone: {propriedade.telefone}
                    </Typography>
                  </Box>
                )}
                
                {propriedade.celular && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Celular: {propriedade.celular}
                    </Typography>
                  </Box>
                )}
                
                {propriedade.inscricao_estadual && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Inscrição Estadual: {propriedade.inscricao_estadual}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Classificação: {classificacoes[propriedade.classificacao] || propriedade.classificacao}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Abates Recentes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body1" color="text.secondary">
              Os abates recentes associados a esta propriedade serão exibidos aqui (em implementação).
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Propriedade"
        message={`Tem certeza que deseja excluir a propriedade ${propriedade.nome}? Esta ação não pode ser desfeita.`}
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

export default PropriedadeDetailPage;