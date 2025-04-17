// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  Upload as UploadIcon, 
  EventNote as EventNoteIcon, // Adicione esta linha para a Escala
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { hasPermission } from '../types/auth';

const drawerWidth = 240;

interface MenuItemData {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string; // Adicionando a propriedade permission como opcional
}

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const mainMenuItems: MenuItemData[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: 'dashboard' },
    { text: 'Escala', icon: <EventNoteIcon />, path: '/escala', permission: 'escala' },
    { text: 'Agenda', icon: <EventNoteIcon />, path: '/agenda', permission: 'agenda' },
    { text: 'Produtores', icon: <PeopleIcon />, path: '/produtores', permission: 'produtores' },
    { text: 'Propriedades', icon: <LocationOnIcon />, path: '/propriedades', permission: 'propriedades' },
    { text: 'Frigoríficos', icon: <BusinessIcon />, path: '/frigorificos', permission: 'frigorificos' },
    { text: 'Abates', icon: <InventoryIcon />, path: '/abates', permission: 'abates' },
    { text: 'Importar Planilha', icon: <UploadIcon />, path: '/importar', permission: 'importar' },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios', permission: 'relatorios' },
    { text: 'Gerenciar Usuários', icon: <PeopleIcon />, path: '/usuarios', permission: 'admin_users' },
  ];

  const secondaryMenuItems: MenuItemData[] = [
    { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
  ];

  const userRole = user?.role || 'tecnico';

  const filteredMainMenuItems = mainMenuItems.filter(
    item => !item.permission || hasPermission(userRole, item.permission)
  );

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          px: [1],
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight={700}>
          ACABOI
        </Typography>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="close drawer"
            onClick={handleDrawerToggle}
            edge="start"
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav">
        {filteredMainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {secondaryMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Sistema de Gestão de Abates
          </Typography>
          <Box>
            <Tooltip title="Configurações de conta">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={menuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 
                  user?.email?.charAt(0)?.toUpperCase() || 
                  'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={menuOpen}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/perfil'); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Meu Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            ...(isMobile ? {} : { position: 'relative' }),
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;