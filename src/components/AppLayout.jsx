import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Button, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import EventIcon from '@mui/icons-material/EventNote';
import PeopleIcon from '@mui/icons-material/People';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import LayersIcon from '@mui/icons-material/Layers';
import StoreIcon from '@mui/icons-material/Storefront';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, roles: ['SALON_OWNER', 'RECEPTIONIST'] },
  { to: '/appointments', label: 'Appointments', icon: <EventIcon />, roles: ['SALON_OWNER', 'RECEPTIONIST'] },
  { to: '/clients', label: 'Clients', icon: <PeopleIcon />, roles: ['SALON_OWNER', 'RECEPTIONIST'] },
  { to: '/subscription', label: 'Subscription', icon: <CardMembershipIcon />, roles: ['SALON_OWNER'] },
  { to: '/plans', label: 'Plans', icon: <LayersIcon />, roles: ['SUPER_ADMIN'] },
  { to: '/salons', label: 'Salons', icon: <StoreIcon />, roles: ['SUPER_ADMIN'] },
  { to: '/subscription-history', label: 'Subscription History', icon: <HistoryIcon />, roles: ['SUPER_ADMIN'] },
];

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  SALON_OWNER: 'Salon Owner',
  RECEPTIONIST: 'Receptionist',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeMobileDrawer = () => setMobileOpen(false);

  const drawerContent = (
    <>
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="subtitle2" noWrap>
          {user.email}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={closeMobileDrawer}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': { bgcolor: 'primary.main', color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: '100%',
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} noWrap>
            Salon CRM
          </Typography>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={ROLE_LABEL[user.role]}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          />
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <Button
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ minWidth: { xs: 0, sm: 'auto' }, px: { xs: 1, sm: 2 } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Log out</Box>
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0, bgcolor: '#fff' },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0, bgcolor: '#fff' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: '100%',
          p: { xs: 1.5, sm: 2, md: 3 },
          mt: { xs: 7, sm: 8 },
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
