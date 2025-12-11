import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';

export default function AddWarehouse() {
  const [warehouse, setWarehouse] = useState({
    name: '',
    location: '',
    code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    setWarehouse({ ...warehouse, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouse),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to add warehouse: ${res.status} ${res.statusText}`);
      }
      
      showSuccess('Warehouse added successfully!');
      setTimeout(() => router.push('/warehouses'), 1500); // Show success then redirect
    } catch (err) {
      console.error('Add warehouse error:', err);
      const errorMessage = err.message || 'Failed to add warehouse. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4, px: { xs: 0, md: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add New Warehouse
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Warehouse Code"
              name="code"
              value={warehouse.code}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Warehouse Name"
              name="name"
              value={warehouse.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Location"
              name="location"
              value={warehouse.location}
              onChange={handleChange}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Adding...' : 'Add Warehouse'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/warehouses"
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

