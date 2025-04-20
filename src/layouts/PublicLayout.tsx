// src/layouts/PublicLayout.tsx
import React from 'react';
import { Box, Container, Typography, Link, useTheme } from '@mui/material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Box
        component="header"
        sx={{
          py: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h5" component="h1" fontWeight="bold">
            ACABOI - Sistema de Gestão de Abates
          </Typography>
        </Container>
      </Box>
      
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        {children}
      </Box>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="/">
              ACABOI
            </Link>{' '}
            {new Date().getFullYear()}
            {'. Todos os direitos reservados.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;