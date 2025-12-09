import { useState } from 'react'
import { Toolbar, Box } from '@mui/material';
import AppDrawer from './AppDrawer';
import AppBarComponent from './AppBarComponent';

export default function Layout({ children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const drawerWidth = 240;

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarComponent onMenuClick={toggleDrawer} isDrawerOpen={isDrawerOpen} />
      <AppDrawer isOpen={isDrawerOpen} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: isDrawerOpen ? 0 : `-${drawerWidth}px`,
          transition: (theme) => theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}