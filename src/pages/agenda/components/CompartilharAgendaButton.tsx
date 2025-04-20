// src/pages/agenda/components/CompartilharAgendaButton.tsx
import React, { useState } from 'react';
import { 
  Button, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CompartilharAgendaButtonProps {
  semana: number;
  ano: number;
}

const CompartilharAgendaButton: React.FC<CompartilharAgendaButtonProps> = ({ semana, ano }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const publicUrl = `${window.location.origin}/agenda_view?semana=${semana}&ano=${ano}`;
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <>
      <Tooltip title="Compartilhar Agenda">
      <Button
        startIcon={<ShareIcon />}
        variant="outlined"
        color="primary"
        onClick={handleOpen}
        size="small"
        sx={{ 
          color: 'white',
          '&:hover': {
            color: 'white',
            borderColor: 'white'
          }
        }}
      >
        Compartilhar
      </Button>
      </Tooltip>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Compartilhar Agenda</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Use o link abaixo para compartilhar a visualização pública da agenda de abates:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={publicUrl}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton color="primary" onClick={handleCopyLink} sx={{ ml: 1 }}>
              <ContentCopyIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Este link pode ser acessado por qualquer pessoa, sem necessidade de login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Link copiado para a área de transferência!
        </Alert>
      </Snackbar>
    </>
  );
};

export default CompartilharAgendaButton;