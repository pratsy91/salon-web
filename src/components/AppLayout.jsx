import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Chip, Divider, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Button,
} from '@mui/material';
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

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Salon CRM
          </Typography>
          <Chip size="small" color="primary" variant="outlined" label={ROLE_LABEL[user.role]} />
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
            {user.name?.[0]?.toUpperCase()}
          </Avatar>
          <Button size="small" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 0, bgcolor: '#fff' },
        }}
      >
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
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
