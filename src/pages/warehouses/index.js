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

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await fetch('/api/warehouses');
      
      if (!res.ok) {
        throw new Error(`Failed to load warehouses: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setWarehouses(data);
    } catch (err) {
      console.error('Warehouses fetch error:', err);
      const errorMessage = err.message || 'Failed to load warehouses. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = (id) => {
    setSelectedWarehouseId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWarehouseId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/warehouses/${selectedWarehouseId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWarehouses(warehouses.filter((warehouse) => warehouse.id !== selectedWarehouseId));
        showSuccess('Warehouse deleted successfully');
        handleClose();
      } else {
        throw new Error(`Failed to delete warehouse: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showError(error.message || 'Failed to delete warehouse. Please try again.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading warehouses..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchWarehouses} title="Error Loading Warehouses" />;
  }

  return (
    <>
      <Head>
        <title>Warehouses - GreenSupply Co</title>
        <meta name="description" content="Manage warehouse locations across North America" />
      </Head>
      
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Warehouses
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/warehouses/add"
          >
            Add Warehouse
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Code</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell>{warehouse.code}</TableCell>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      href={`/warehouses/edit/${warehouse.id}`}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleClickOpen(warehouse.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {warehouses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No warehouses available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this warehouse? This action cannot be undone.
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

