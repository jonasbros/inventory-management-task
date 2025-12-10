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
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingState from '../../components/LoadingState';
import FormErrorState from '../../components/FormErrorState';

export default function EditStock() {
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
  const [isRestockMode, setIsRestockMode] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [restockAmount, setRestockAmount] = useState('');

  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          const [stockRes, productsRes, warehousesRes] = await Promise.all([
            fetch(`/api/stock/${id}`),
            fetch('/api/products'),
            fetch('/api/warehouses')
          ]);
          
          if (!stockRes.ok) {
            throw new Error(`Failed to load stock record: ${stockRes.status} ${stockRes.statusText}`);
          }
          if (!productsRes.ok) {
            throw new Error(`Failed to load products: ${productsRes.status} ${productsRes.statusText}`);
          }
          if (!warehousesRes.ok) {
            throw new Error(`Failed to load warehouses: ${warehousesRes.status} ${warehousesRes.statusText}`);
          }
          
          const [stockData, productsData, warehousesData] = await Promise.all([
            stockRes.json(),
            productsRes.json(),
            warehousesRes.json()
          ]);
          
          setStock(stockData);
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
    }
  }, [id]);

  // Handle restock mode based on query parameters
  useEffect(() => {
    if (router.isReady) {
      const { restock, currentQuantity } = router.query;
      
      if (restock === 'true' && currentQuantity) {
        setIsRestockMode(true);
        setOriginalQuantity(parseInt(currentQuantity));
      }
    }
  }, [router.isReady, router.query]);

  const handleChange = (e) => {
    setStock({ ...stock, [e.target.name]: e.target.value });
  };

  const handleRestockAmountChange = (e) => {
    const amount = e.target.value;
    setRestockAmount(amount);
    
    // Calculate new total quantity
    if (amount && !isNaN(amount)) {
      const newTotal = originalQuantity + parseInt(amount);
      setStock(prevStock => ({ ...prevStock, quantity: newTotal.toString() }));
    } else {
      setStock(prevStock => ({ ...prevStock, quantity: originalQuantity.toString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(stock.productId),
          warehouseId: parseInt(stock.warehouseId),
          quantity: parseInt(stock.quantity),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update stock: ${res.status} ${res.statusText}`);
      }
      
      showSuccess(isRestockMode ? 'Inventory restocked successfully!' : 'Stock record updated successfully!');
      setTimeout(() => router.push('/stock'), 1500); // Show success then redirect
    } catch (err) {
      console.error('Update stock error:', err);
      const errorMessage = err.message || 'Failed to update stock record. Please try again.';
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
        const [stockRes, productsRes, warehousesRes] = await Promise.all([
          fetch(`/api/stock/${id}`),
          fetch('/api/products'),
          fetch('/api/warehouses')
        ]);
        
        if (!stockRes.ok) {
          throw new Error(`Failed to load stock record: ${stockRes.status} ${stockRes.statusText}`);
        }
        if (!productsRes.ok) {
          throw new Error(`Failed to load products: ${productsRes.status} ${productsRes.statusText}`);
        }
        if (!warehousesRes.ok) {
          throw new Error(`Failed to load warehouses: ${warehousesRes.status} ${warehousesRes.statusText}`);
        }
        
        const [stockData, productsData, warehousesData] = await Promise.all([
          stockRes.json(),
          productsRes.json(),
          warehousesRes.json()
        ]);
        
        setStock(stockData);
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
    return <LoadingState message="Loading stock record..." minHeight="100vh" />;
  }
  
  if (loadError) {
    return <FormErrorState error={loadError} onRetry={handleRetry} title="Error Loading Stock Data" />;
  }

  return (
    <> 
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isRestockMode ? 'Restock Inventory' : 'Edit Stock Record'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {isRestockMode && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Stock:</strong> {originalQuantity} units
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>New Total:</strong> {stock.quantity} units
              </Typography>
            </Box>
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
              disabled={isRestockMode}
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
              disabled={isRestockMode}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>
            
            {isRestockMode ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Add Quantity"
                  type="number"
                  inputProps={{ min: '1' }}
                  value={restockAmount}
                  onChange={handleRestockAmountChange}
                  helperText={`Current: ${originalQuantity} units → New Total: ${stock.quantity} units`}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="New Total Quantity"
                  name="quantity"
                  type="number"
                  value={stock.quantity}
                  disabled
                  helperText="This will be the final quantity after restocking"
                />
              </>
            ) : (
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
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? (isRestockMode ? 'Adding...' : 'Updating...') : (isRestockMode ? 'Add to Inventory' : 'Update Stock')}
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

