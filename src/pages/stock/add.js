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
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import FormErrorState from '../components/FormErrorState';

export default function AddStock() {
  const [stock, setStock] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
  });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const router = useRouter();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses')
        ]);
        
        if (!productsRes.ok) {
          throw new Error(`Failed to load products: ${productsRes.status} ${productsRes.statusText}`);
        }
        if (!warehousesRes.ok) {
          throw new Error(`Failed to load warehouses: ${warehousesRes.status} ${warehousesRes.statusText}`);
        }
        
        const [productsData, warehousesData] = await Promise.all([
          productsRes.json(),
          warehousesRes.json()
        ]);
        
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        console.error('Load data error:', err);
        const errorMessage = err.message || 'Failed to load data. Please try again.';
        setLoadError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(stock.productId),
          warehouseId: parseInt(stock.warehouseId),
          quantity: parseInt(stock.quantity),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to add stock: ${res.status} ${res.statusText}`);
      }
      
      showSuccess('Stock record added successfully!');
      setTimeout(() => router.push('/stock'), 1500); // Show success then redirect
    } catch (err) {
      console.error('Add stock error:', err);
      const errorMessage = err.message || 'Failed to add stock record. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setLoadError(null);
    setLoading(true);
    
    const loadData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/warehouses')
        ]);
        
        if (!productsRes.ok) {
          throw new Error(`Failed to load products: ${productsRes.status} ${productsRes.statusText}`);
        }
        if (!warehousesRes.ok) {
          throw new Error(`Failed to load warehouses: ${warehousesRes.status} ${warehousesRes.statusText}`);
        }
        
        const [productsData, warehousesData] = await Promise.all([
          productsRes.json(),
          warehousesRes.json()
        ]);
        
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        console.error('Retry load data error:', err);
        const errorMessage = err.message || 'Failed to load data. Please try again.';
        setLoadError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  };
  
  if (loading) {
    return <LoadingState message="Loading form data..." minHeight="100vh" />;
  }
  
  if (loadError) {
    return <FormErrorState error={loadError} onRetry={handleRetry} title="Error Loading Form Data" />;
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4, px: { xs: 0, md: 4 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Add Stock Record
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
              select
              label="Product"
              name="productId"
              value={stock.productId}
              onChange={handleChange}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Warehouse"
              name="warehouseId"
              value={stock.warehouseId}
              onChange={handleChange}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              inputProps={{ min: '0' }}
              value={stock.quantity}
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
                {submitting ? 'Adding...' : 'Add Stock'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                href="/stock"
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

