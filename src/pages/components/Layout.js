import { useState } from 'react'
import { Toolbar, Box, useMediaQuery, useTheme } from '@mui/material';
import AppDrawer from './AppDrawer';
import AppBarComponent from './AppBarComponent';

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Mobile = below md breakpoint (960px)
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile); // Start closed on mobile
  const drawerWidth = 240;

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Auto-close drawer on mobile when route changes or clicks outside
  const handleDrawerClose = () => {
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarComponent onMenuClick={toggleDrawer} isDrawerOpen={isDrawerOpen} />
      <AppDrawer 
        isOpen={isDrawerOpen} 
        drawerWidth={drawerWidth} 
        isMobile={isMobile}
        onClose={handleDrawerClose}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // On mobile, drawer is overlay so no margin needed
          // On desktop, adjust margin based on drawer state
          marginLeft: isMobile ? 0 : (isDrawerOpen ? 0 : `-${drawerWidth}px`),
          transition: (theme) => theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          padding: isMobile ? '8px' : '16px',
          minHeight: '100vh',
          width: 0, // Force width to be constrained by flex
          minWidth: 0, // Allow flexbox to shrink content
          overflow: 'hidden', // Prevent horizontal overflow
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}