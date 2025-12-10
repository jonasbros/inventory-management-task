import { Container, Paper, Alert, Button } from '@mui/material';

/**
 * Reusable form error state component for edit forms
 * Used when initial data loading fails
 */
export default function FormErrorState({ 
  error, 
  onRetry,
  title = "Error Loading Data",
  maxWidth = "sm"
}) {
  if (!error) return null;
  
  return (
    <Container maxWidth={maxWidth} sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert 
          severity="error" 
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
        >
          <strong>{title}</strong>
          <br />
          {error}
        </Alert>
      </Paper>
    </Container>
  );
}