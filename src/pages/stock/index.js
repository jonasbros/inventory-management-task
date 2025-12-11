import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  getStockColumns, 
  getEditAction, 
  getDeleteAction, 
  getTransferAction,
  getRequestStockAction,
  getProductFilter,
  getWarehouseFilter
} from '../../utils/tableColumns';
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
  const router = useRouter();

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

  const handleTransfer = (stockRecord) => {
    const params = new URLSearchParams({
      productId: stockRecord.productId,
      fromWarehouseId: stockRecord.warehouseId
    });
    router.push(`/transfers/add?${params.toString()}`);
  };

  const handleRequestStock = (stockRecord) => {
    const params = new URLSearchParams({
      productId: stockRecord.productId,
      toWarehouseId: stockRecord.warehouseId
    });
    router.push(`/transfers/add?${params.toString()}`);
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
      
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{
          display: 'flex', 
          flexDirection: {xs: 'column', sm: 'row'}, 
          justifyContent: 'space-between', 
          alignItems: {xs: 'start', sm: 'center'}, 
          mb: 3,
          gap: 1,
        }}>
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

        <AppTable
          data={stock}
          columns={getStockColumns(products, warehouses)}
          title="Stock Levels"
          searchable={true}
          filterable={true} 
          sortable={true}
          paginated={true}
          filters={[
            getProductFilter(products),
            getWarehouseFilter(warehouses)
          ]}
          actions={[
            getEditAction('/stock/edit/:id'),
            getTransferAction(handleTransfer),
            getRequestStockAction(handleRequestStock),
            getDeleteAction(handleClickOpen)
          ]}
          emptyMessage="No stock records available."
        />

        <Dialog 
          open={open} 
          onClose={handleClose}
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: 1, lg: 3 }
            }
          }}
        >
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

