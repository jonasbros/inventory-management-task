import { Drawer, Toolbar } from '@mui/material';
import DrawerList from './DrawerList';

export default function AppDrawer({ isOpen, drawerWidth = 240 }) {
  return (
    <Drawer 
      open={isOpen} 
      variant="persistent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <DrawerList/>
    </Drawer>
  );
}
