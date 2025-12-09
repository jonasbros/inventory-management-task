import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';

export default function AppBarComponent({ onMenuClick, isDrawerOpen }) {
  const drawerWidth = 240;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        marginLeft: isDrawerOpen ? `${drawerWidth}px` : 0,
        width: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Inventory2Icon sx={{
          mr: 2,
          color: 'primary.main',
          fontSize: '1.5rem'
        }} />
        <Typography variant="h6" noWrap component="div">
        GreenSupply Co - Inventory Management
        </Typography>
      </Toolbar>
    </AppBar>
  );
}