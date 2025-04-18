// src/pages/frigorificos/FrigorificoDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Frigorifico, getFrigorifico, deleteFrigorifico } from '../../services/frigorificoService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { supabase } from '../../services/supabase';

const FrigorificoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [frigorifico, setFrigorifico] = useState<Frigorifico | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const loadFrigorifico = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await getFrigorifico(parseInt(id));
      if (data) {
        setFrigorifico(data);
        
        // Buscar informações do usuário
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .single();
        
        setUsuario(userData);
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
  }, [
    // Dependências:
    id,                // ID obtido de useParams ou estado
    setFrigorifico,    // Função de estado estável
    setUsuario,        // Função de estado estável
    setIsLoading,      // Função de estado estável
    setSnackbar        // Função de estado estável
  ]);

  useEffect(() => {
    loadFrigorifico();
  }, [id, loadFrigorifico]);

  const handleEdit = () => {
    navigate(`/frigorificos/editar/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteFrigorifico(parseInt(id));
      setSnackbar({
        open: true,
        message: 'Frigorífico excluído com sucesso!',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/frigorificos');
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir frigorífico:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir frigorífico. Tente novamente.',
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

  if (!frigorifico) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Frigorífico não encontrado
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/frigorificos')}
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
           {usuario?.name || frigorifico.nome}
         </Typography>
       </Box>
       <Box sx={{ display: 'flex', gap: 2 }}>
         <Button
           variant="outlined"
           startIcon={<ArrowBackIcon />}
           onClick={() => navigate('/frigorificos')}
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
                 <BusinessIcon color="primary" sx={{ mr: 1 }} />
                 <Typography variant="body1" fontWeight={500}>
                   {frigorifico.nome}
                 </Typography>
               </Box>
               
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                 <Typography variant="body1">
                   {frigorifico.endereco}, {frigorifico.cidade}
                 </Typography>
               </Box>
               
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                 <BusinessIcon color="primary" sx={{ mr: 1 }} />
                 <Typography variant="body1">
                   CNPJ: {frigorifico.cnpj}
                 </Typography>
               </Box>
               
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <EmailIcon color="primary" sx={{ mr: 1 }} />
                 <Typography variant="body1">
                   {usuario?.email || 'Email não disponível'}
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
                 <strong>Data de Cadastro:</strong> {frigorifico.created_at 
                  ? new Date(frigorifico.created_at).toLocaleDateString('pt-BR') 
                  : 'Não disponível'}
               </Typography>
               
               <Typography variant="body1">
                <strong>Última Atualização:</strong> {frigorifico.updated_at 
                  ? new Date(frigorifico.updated_at).toLocaleDateString('pt-BR') 
                  : 'Não disponível'}
              </Typography>
             </CardContent>
           </Card>
         </Box>
       </Box>
     </Stack>

     <ConfirmDialog
       open={deleteDialogOpen}
       title="Excluir Frigorífico"
       message={`Tem certeza que deseja excluir o frigorífico ${frigorifico.nome}? Esta ação não pode ser desfeita.`}
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

export default FrigorificoDetailPage;