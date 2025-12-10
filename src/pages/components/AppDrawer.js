import { Drawer, Toolbar } from '@mui/material';
import DrawerList from './DrawerList';

export default function AppDrawer({ isOpen, drawerWidth = 240, isMobile = false, onClose }) {
  return (
    <Drawer 
      open={isOpen} 
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      onClose={onClose} // Only used for temporary variant
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
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
      <DrawerList onItemClick={isMobile ? onClose : undefined} />
    </Drawer>
  );
}
