import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './styles/theme';
import { AuthProvider, useAuth } from './store/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProdutoresPage from './pages/produtores/ProdutoresPage';
import ProdutorFormPage from './pages/produtores/ProdutorFormPage';
import ProdutorDetailPage from './pages/produtores/ProdutorDetailPage';
import PropriedadesPage from './pages/propriedades/PropriedadesPage';
import PropriedadeFormPage from './pages/propriedades/PropriedadeFormPage';
import PropriedadeDetailPage from './pages/propriedades/PropriedadeDetailPage';
import FrigorificosPage from './pages/frigorificos/FrigorificosPage';
import FrigorificoFormPage from './pages/frigorificos/FrigorificoFormPage';
import FrigorificoDetailPage from './pages/frigorificos/FrigorificoDetailPage';
import AbatesPage from './pages/abates/AbatesPage';
import AbateFormPage from './pages/abates/AbateFormPage';
import AbateDetailPage from './pages/abates/AbateDetailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersListPage from './pages/users/UsersListPage';
import UserFormPage from './pages/users/UserFormPage';
import ProfilePage from './pages/ProfilePage';
import ImportPage from './pages/imports/ImportPage';
import ReportsPage from './pages/reports/ReportsPage';
import EscalaListPage from './pages/escala/EscalaListPage';
import EscalaFormPage from './pages/escala/EscalaFormPage';
import EscalaDetailPage from './pages/escala/EscalaDetailPage';
import AgendaAbatesListPage from './pages/agenda/AgendaAbatesListPage';
import { Box, CircularProgress, Typography } from '@mui/material';

// Cria um cliente de query
const queryClient = new QueryClient();

// Rota protegida que requer autenticação
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode,
  requiredRoles?: ('admin' | 'tecnico')[] 
}> = ({ 
  children, 
  requiredRoles = ['admin', 'tecnico'] 
}) => {
  const { user, loading } = useAuth();

  // Adicione logs para diagnóstico
  console.log("User em ProtectedRoute:", user);
  console.log("Loading:", loading);
  console.log("User role:", user?.role);
  console.log("Required roles:", requiredRoles);
  
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar se o usuário tem o papel necessário
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as any)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Acesso Restrito
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Você não tem permissão para acessar esta página.
        </Typography>
      </Box>
    );
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rotas protegidas com o layout do dashboard */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Rotas de produtores */}
                <Route path="produtores" element={<ProdutoresPage />} />
                <Route path="produtores/novo" element={<ProdutorFormPage />} />
                <Route path="produtores/editar/:id" element={<ProdutorFormPage />} />
                <Route path="produtores/:id" element={<ProdutorDetailPage />} />

                <Route path="propriedades" element={<PropriedadesPage />} />
                <Route path="propriedades/novo" element={<PropriedadeFormPage />} />
                <Route path="propriedades/editar/:id" element={<PropriedadeFormPage />} />
                <Route path="propriedades/:id" element={<PropriedadeDetailPage />} />

                <Route path="frigorificos" element={<FrigorificosPage />} />
                <Route path="frigorificos/novo" element={<FrigorificoFormPage />} />
                <Route path="frigorificos/editar/:id" element={<FrigorificoFormPage />} />
                <Route path="frigorificos/:id" element={<FrigorificoDetailPage />} />

                <Route path="abates" element={<AbatesPage />} />
                <Route path="abates/novo" element={<AbateFormPage />} />
                <Route path="abates/editar/:id" element={<AbateFormPage />} />
                <Route path="abates/:id" element={<AbateDetailPage />} />

                <Route path="agenda" element={<AgendaAbatesListPage />} />

                {/* Rotas de usuários (apenas para admin) */}
                <Route path="usuarios" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UsersListPage />
                  </ProtectedRoute>
                } />
                <Route path="usuarios/novo" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UserFormPage />
                  </ProtectedRoute>
                } />
                <Route path="usuarios/editar/:id" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UserFormPage />
                  </ProtectedRoute>
                } />

                <Route path="escala" element={<EscalaListPage />} />
                <Route path="escala/novo" element={<EscalaFormPage />} />
                <Route path="escala/:id" element={<EscalaDetailPage />} />
                <Route path="escala/editar/:id" element={<EscalaFormPage />} />

                <Route path="importar" element={<ImportPage />} />
                <Route path="perfil" element={<ProfilePage />} />
                <Route path="relatorios" element={<ReportsPage />} />
                
                {/* Outras rotas */}
                <Route path="analises" element={<div>Análises - Em breve</div>} />
                <Route path="configuracoes" element={<div>Configurações - Em breve</div>} />
                
                {/* Rota para qualquer caminho não encontrado dentro do dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Route>

              {/* Rota para qualquer caminho não encontrado */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;