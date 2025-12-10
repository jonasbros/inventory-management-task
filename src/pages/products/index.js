import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material';
import AppTable from '../components/AppTable';
import { 
  getProductsColumns, 
  getEditAction, 
  getDeleteAction, 
  getCategoryFilter
} from '../../utils/tableColumns';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error(`Failed to load products: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Products fetch error:', err);
      const errorMessage = err.message || 'Failed to load products. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = (id) => {
    setSelectedProductId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProductId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${selectedProductId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((product) => product.id !== selectedProductId));
        handleClose();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Loading products..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProducts} title="Error Loading Products" />;
  }

  return (
    <>
      <Head>
        <title>Products - GreenSupply Co</title>
        <meta name="description" content="Manage eco-friendly products in your inventory" />
      </Head>
      
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Products
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/products/add"
          >
            Add Product
          </Button>
        </Box>

        <AppTable
          data={products}
          columns={getProductsColumns()}
          title="Products"
          searchable={true}
          filterable={true}
          sortable={true}
          paginated={true}
          filters={[getCategoryFilter(products)]}
          actions={[
            getEditAction('/products/edit/:id'),
            getDeleteAction(handleClickOpen)
          ]}
          emptyMessage="No products available."
        />

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

