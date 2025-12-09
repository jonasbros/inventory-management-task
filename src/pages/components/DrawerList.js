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

export default function DrawerList() {
  return (
    <Box sx={{ width: 240 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
      </Box>
      <Divider />
      <List>
      <ListItemButton component={Link} href="/">
          <ListItemIcon>
            <SpaceDashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={Link} href="/products">
          <ListItemIcon>
            <CategoryIcon />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItemButton>
        <ListItemButton component={Link} href="/warehouses">
          <ListItemIcon>
            <BusinessIcon />
          </ListItemIcon>
          <ListItemText primary="Warehouses" />
        </ListItemButton>
        <ListItemButton component={Link} href="/stock">
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Stock Levels" />
        </ListItemButton>
      </List>
    </Box>
  );
}