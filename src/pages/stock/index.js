import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const responses = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/products'),
        fetch('/api/warehouses'),
      ]);

      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['stock', 'products', 'warehouses'];
          throw new Error(`Failed to load ${endpoints[index]}: ${response.status} ${response.statusText}`);
        }
      });

      const [stockData, productsData, warehousesData] = await Promise.all(
        responses.map(res => res.json())
      );

      setStock(stockData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (err) {
      console.error('Stock data fetch error:', err);
      const errorMessage = err.message || 'Failed to load stock data. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.sku})` : 'Unknown';
  };

  const getWarehouseName = (warehouseId) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? `${warehouse.name} (${warehouse.code})` : 'Unknown';
  };

  const handleClickOpen = (id) => {
    setSelectedStockId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStockId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/stock/${selectedStockId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setStock(stock.filter((item) => item.id !== selectedStockId));
        showSuccess('Stock record deleted successfully');
        handleClose();
      } else {
        throw new Error(`Failed to delete stock record: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
      showError(error.message || 'Failed to delete stock record. Please try again.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading stock data..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} title="Error Loading Stock Data" />;
  }

  return (
    <>
      <Head>
        <title>Stock Levels - GreenSupply Co</title>
        <meta name="description" content="Monitor and manage inventory stock levels across all warehouses" />
      </Head>
      
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Stock Levels
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/stock/add"
          >
            Add Stock Record
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Warehouse</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getProductName(item.productId)}</TableCell>
                  <TableCell>{getWarehouseName(item.warehouseId)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      href={`/stock/edit/${item.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleClickOpen(item.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {stock.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No stock records available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Stock Record</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this stock record? This action cannot be undone.
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

