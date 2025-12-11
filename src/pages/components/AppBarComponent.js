import { AppBar, Toolbar, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';

export default function AppBarComponent({ onMenuClick, isDrawerOpen }) {
  const drawerWidth = 240;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        marginLeft: (isDrawerOpen && !isMobile) ? `${drawerWidth}px` : 0,
        width: (isDrawerOpen && !isMobile) ? `calc(100% - ${drawerWidth}px)` : '100%',
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
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          noWrap 
          component="div"
          sx={{ 
            fontSize: isMobile ? '1rem' : '1.25rem',
            flexGrow: 1,
            fontWeight: 600
          }}
        >
          {isMobile ? "GreenSupply Co" : "GreenSupply Co - Inventory Management"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}