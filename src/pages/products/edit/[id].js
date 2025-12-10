import { useState, useEffect } from 'react';
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
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingState from '../../components/LoadingState';
import FormErrorState from '../../components/FormErrorState';

export default function EditProduct() {
  const [product, setProduct] = useState({
    sku: '',
    name: '',
    category: '',
    unitCost: '',
    reorderPoint: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`);
          
          if (!res.ok) {
            throw new Error(`Failed to load product: ${res.status} ${res.statusText}`);
          }
          
          const data = await res.json();
          setProduct(data);
        } catch (err) {
          console.error('Load product error:', err);
          const errorMessage = err.message || 'Failed to load product. Please try again.';
          setLoadError(errorMessage);
          showError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      
      loadProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          unitCost: parseFloat(product.unitCost),
          reorderPoint: parseInt(product.reorderPoint),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update product: ${res.status} ${res.statusText}`);
      }
      
      showSuccess('Product updated successfully!');
      setTimeout(() => router.push('/products'), 1500); // Show success then redirect
    } catch (err) {
      console.error('Update product error:', err);
      const errorMessage = err.message || 'Failed to update product. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setLoadError(null);
    setLoading(true);
    
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        
        if (!res.ok) {
          throw new Error(`Failed to load product: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Retry load product error:', err);
        const errorMessage = err.message || 'Failed to load product. Please try again.';
        setLoadError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  };
  
  if (loading) {
    return <LoadingState message="Loading product..." minHeight="100vh" />;
  }
  
  if (loadError) {
    return <FormErrorState error={loadError} onRetry={handleRetry} title="Error Loading Product" />;
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Product
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
              label="SKU"
              name="sku"
              value={product.sku}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Product Name"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Unit Cost"
              name="unitCost"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={product.unitCost}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Reorder Point"
              name="reorderPoint"
              type="number"
              inputProps={{ min: '0' }}
              value={product.reorderPoint}
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
                {submitting ? 'Updating...' : 'Update Product'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/products"
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

