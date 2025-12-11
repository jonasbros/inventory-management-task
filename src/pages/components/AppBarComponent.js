import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Inventory2Icon from '@mui/icons-material/Inventory2';

export default function AppBarComponent({ onMenuClick, isDrawerOpen }) {
  const drawerWidth = 240;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        marginLeft: { xs: 0, md: isDrawerOpen ? `${drawerWidth}px` : 0 },
        width: { xs: '100%', md: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
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
          variant={{ xs: "subtitle1", md: "h6" }} 
          noWrap 
          component="div"
          sx={{ 
            fontSize: { xs: '1rem', md: '1.25rem' },
            flexGrow: 1,
            fontWeight: 600
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
            GreenSupply Co - Inventory Management
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
            GreenSupply Co
          </Box>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}