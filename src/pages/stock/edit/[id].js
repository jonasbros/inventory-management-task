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
} from '@mui/material';

export default function EditStock() {
  const [stock, setStock] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
  });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRestockMode, setIsRestockMode] = useState(false);
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const [restockAmount, setRestockAmount] = useState('');

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      Promise.all([
        fetch(`/api/stock/${id}`).then(res => res.json()),
        fetch('/api/products').then(res => res.json()),
        fetch('/api/warehouses').then(res => res.json()),
      ]).then(([stockData, productsData, warehousesData]) => {
        setStock(stockData);
        setProducts(productsData);
        setWarehouses(warehousesData);
        setLoading(false);
      });
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
    const res = await fetch(`/api/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: parseInt(stock.productId),
        warehouseId: parseInt(stock.warehouseId),
        quantity: parseInt(stock.quantity),
      }),
    });
    if (res.ok) {
      router.push('/stock');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <> 
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {isRestockMode ? 'Restock Inventory' : 'Edit Stock Record'}
          </Typography>
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
              >
                {isRestockMode ? 'Add to Inventory' : 'Update Stock'}
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

