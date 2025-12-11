import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import FormErrorState from '../components/FormErrorState';
import { useTransferData } from '../../hooks/useTransferForm';

export default function AddTransfer() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: ''
  });

  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const { 
    fetchData, 
    getAvailableStock,
    getWarehousesWithStock,
    getDestinationWarehouses,
    getSelectedProduct,
    validateTransferForm, 
    submitTransfer 
  } = useTransferData();

  useEffect(() => {
    fetchData(setProducts, setWarehouses, setStock, setError, setLoading);
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { productId, fromWarehouseId, toWarehouseId } = router.query;
      if (productId) setFormData(prev => ({ ...prev, productId: parseInt(productId) }));
      if (fromWarehouseId) setFormData(prev => ({ ...prev, fromWarehouseId: parseInt(fromWarehouseId) }));
      if (toWarehouseId) setFormData(prev => ({ ...prev, toWarehouseId: parseInt(toWarehouseId) }));
    }
  }, [router.isReady, router.query]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'productId') {
      // Only reset destination if it wasn't pre-filled via URL params
      const shouldResetDestination = !router.query.toWarehouseId;
      setFormData(prev => ({ 
        ...prev, 
        productId: value,
        fromWarehouseId: '',
        toWarehouseId: shouldResetDestination ? '' : prev.toWarehouseId,
        quantity: ''
      }));
    }

    if (name === 'fromWarehouseId') {
      setFormData(prev => ({ 
        ...prev, 
        fromWarehouseId: value,
        quantity: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateTransferForm(formData, stock, setErrors)) return;

    await submitTransfer(formData, setSubmitting, setErrors, showSuccess, showError, router);
  };

  const handleRetry = () => {
    fetchData(setProducts, setWarehouses, setStock, setError, setLoading);
  };

  if (loading) {
    return <LoadingState message="Loading transfer form..." />;
  }

  if (error && !loading) {
    return <ErrorState error={error} onRetry={handleRetry} title="Error Loading Transfer Form" />;
  }

  const selectedProduct = getSelectedProduct(formData, products);
  const availableStock = getAvailableStock(formData, stock);
  const warehousesWithStock = getWarehousesWithStock(formData, stock, warehouses);
  const destinationWarehouses = getDestinationWarehouses(formData, warehouses);

  return (
    <>
      <Head>
        <title>Create Stock Transfer - GreenSupply Co</title>
        <meta name="description" content="Transfer inventory between warehouses" />
      </Head>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Stock Transfer
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  name="productId"
                  label="Product"
                  value={formData.productId}
                  onChange={handleInputChange}
                  error={!!errors.productId}
                  helperText={errors.productId}
                  required
                >
                  <MenuItem value="">Select a product</MenuItem>
                  {products?.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  name="fromWarehouseId"
                  label="Source Warehouse"
                  value={formData.fromWarehouseId}
                  onChange={handleInputChange}
                  error={!!errors.fromWarehouseId}
                  helperText={errors.fromWarehouseId}
                  disabled={!formData.productId}
                  required
                >
                  <MenuItem value="">Select source warehouse</MenuItem>
                  {!warehousesWithStock.length ? (
                    <MenuItem disabled>
                      No Warehouses with Stocks Available
                    </MenuItem>
                  ) : (
                    warehousesWithStock?.map((warehouse) => {
                      const stockRecord = stock.find(s => 
                        s.productId === parseInt(formData.productId) && s.warehouseId === warehouse.id
                      );
                      return (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.city} (Stock: {stockRecord?.quantity || 0})
                        </MenuItem>
                      );
                    })
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  name="toWarehouseId"
                  label="Destination Warehouse"
                  value={formData.toWarehouseId}
                  onChange={handleInputChange}
                  error={!!errors.toWarehouseId}
                  helperText={errors.toWarehouseId}
                  disabled={!formData.fromWarehouseId && !formData.toWarehouseId}
                  required
                >
                  <MenuItem value="">Select destination warehouse</MenuItem>
                  {destinationWarehouses?.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.city}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="quantity"
                  label="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  error={!!errors.quantity}
                  helperText={errors.quantity || (formData.fromWarehouseId && `Available: ${availableStock}`)}
                  disabled={!formData.fromWarehouseId}
                  inputProps={{ min: 1, max: availableStock }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="notes"
                  label="Transfer Notes (Optional)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this transfer..."
                />
              </Grid>

              {selectedProduct && formData.fromWarehouseId && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Transfer Summary:
                    </Typography>
                    <Typography variant="body2">
                      Product: {selectedProduct.name}<br/>
                      Available Stock: {availableStock} units<br/>
                      Transfer Quantity: {formData.quantity || 0} units
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            <FormErrorState error={errors.submit} />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                {submitting ? 'Creating...' : 'Create Transfer'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/transfers')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}