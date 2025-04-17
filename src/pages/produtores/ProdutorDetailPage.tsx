// src/pages/produtores/ProdutorDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Email } from '@mui/icons-material';
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Produtor, getProdutor, deleteProdutor } from '../../services/produtorService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { getPropriedadesByProdutor } from '../../services/propriedadeService';

const ProdutorDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [produtor, setProdutor] = useState<Produtor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [propriedades, setPropriedades] = useState<any[]>([]);
  const [isLoadingPropriedades, setIsLoadingPropriedades] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadProdutor = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getProdutor(parseInt(id));
      if (data) {
        setProdutor(data);
        // Carregar propriedades associadas
        await loadPropriedades(parseInt(id));
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

  const loadPropriedades = async (produtorId: number) => {
    setIsLoadingPropriedades(true);
    try {
      const data = await getPropriedadesByProdutor(produtorId);
      setPropriedades(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setIsLoadingPropriedades(false);
    }
  };

  useEffect(() => {
    loadProdutor();
  }, [id]);

  const handleAddPropriedade = () => {
    navigate(`/propriedades/novo?produtorId=${id}`);
  };

  const handleViewPropriedade = (propriedadeId: number) => {
    navigate(`/propriedades/${propriedadeId}`);
  };

  const handleEdit = () => {
    navigate(`/produtores/editar/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteProdutor(parseInt(id));
      setSnackbar({
        open: true,
        message: 'Produtor excluído com sucesso!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/produtores');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir produtor:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir produtor. Tente novamente.',
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

  if (!produtor) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Produtor não encontrado
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtores')}
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
            Detalhes do Produtor
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/produtores')}
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
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    {produtor.nome}
                  </Typography>
                </Box>

                {produtor.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {produtor.email}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    CNPJ: {produtor.cnpj}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {produtor.endereco}, {produtor.cidade}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '48%' } }}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informações Adicionais
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Marca do Produtor:</strong> {produtor.marca_produtor}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Data de Cadastro:</strong> {new Date(produtor.created_at).toLocaleDateString('pt-BR')}
                </Typography>
                
                <Typography variant="body1">
                  <strong>Última Atualização:</strong> {new Date(produtor.updated_at).toLocaleDateString('pt-BR')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Propriedades
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleAddPropriedade}
                >
                  Nova Propriedade
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {isLoadingPropriedades ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : propriedades.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  Nenhuma propriedade cadastrada para este produtor.
                </Typography>
              ) : (
                <List>
                  {propriedades.map((propriedade) => (
                    <ListItem
                      key={propriedade.id}
                      secondaryAction={
                        <Tooltip title="Ver detalhes">
                          <IconButton edge="end" onClick={() => handleViewPropriedade(propriedade.id)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      divider
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewPropriedade(propriedade.id)}
                    >
                      <ListItemText
                        primary={propriedade.nome}
                        secondary={`${propriedade.cidade} - ${propriedade.classificacao || 'Sem classificação'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Produtor"
        message={`Tem certeza que deseja excluir o produtor ${produtor.nome}? Esta ação não pode ser desfeita.`}
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

export default ProdutorDetailPage;