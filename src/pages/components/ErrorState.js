import { Container, Alert, Button, Typography } from '@mui/material';

/**
 * Reusable error state component
 * Used across pages for consistent error UI with retry functionality
 */
export default function ErrorState({ 
  error, 
  onRetry,
  title = "Error",
  maxWidth = "md",
  showContainer = true
}) {
  const errorContent = (
    <Alert 
      severity="error" 
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
      sx={{ mb: 2 }}
    >
      <Typography variant="h6" component="div">
        {title}
      </Typography>
      {error}
    </Alert>
  );

  if (showContainer) {
    return (
      <Container maxWidth={maxWidth} sx={{ mt: 4, mb: 4 }}>
        {errorContent}
      </Container>
    );
  }

  return errorContent;
}