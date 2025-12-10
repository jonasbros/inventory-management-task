import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable loading state component
 * Used across pages for consistent loading UI
 */
export default function LoadingState({ 
  message = "Loading...", 
  size = 48,
  minHeight = "calc(100vh - 64px)" 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight,
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}