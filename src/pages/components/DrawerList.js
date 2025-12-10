import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function DrawerList() {
  const router = useRouter();

  const menuItems = [
    { text: 'Dashboard', href: '/', icon: SpaceDashboardIcon },
    { text: 'Products', href: '/products', icon: CategoryIcon },
    { text: 'Warehouses', href: '/warehouses', icon: BusinessIcon },
    { text: 'Stock Levels', href: '/stock', icon: AssessmentIcon },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <ListItemButton 
              key={item.text}
              component={Link} 
              href={item.href}
              sx={{
                backgroundColor: active ? 'primary.main' : 'transparent',
                color: active ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: active ? 'primary.dark' : 'grey.100',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? 'white' : 'text.secondary',
                  minWidth: '40px',
                }}
              >
                <Icon />
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}