import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Container,
  Typography,
  Button,
  Box,
} from '@mui/material';
import AppTable from '../components/AppTable';
import { getTransferColumns } from '../../utils/tableColumns';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const responses = await Promise.all([
        fetch('/api/transfers'),
        fetch('/api/products'),
        fetch('/api/warehouses'),
      ]);

      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['transfers', 'products', 'warehouses'];
          throw new Error(`Failed to load ${endpoints[index]}: ${response.status} ${response.statusText}`);
        }
      });

      const [transfersData, productsData, warehousesData] = await Promise.all(
        responses.map(res => res.json())
      );

      setTransfers(transfersData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (err) {
      console.error('Transfer data fetch error:', err);
      const errorMessage = err.message || 'Failed to load transfer data. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading transfer history..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} title="Error Loading Transfer History" />;
  }

  return (
    <>
      <Head>
        <title>Stock Transfers - GreenSupply Co</title>
        <meta name="description" content="View and manage inventory transfers between warehouses" />
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
            Stock Transfers
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/transfers/add"
          >
            Create Transfer
          </Button>
        </Box>

        <AppTable
          data={transfers}
          columns={getTransferColumns(products, warehouses)}
          title="Transfer History"
          searchable={true}
          filterable={true} 
          sortable={true}
          paginated={true}
          emptyMessage="No transfers found."
        />
      </Container>
    </>
  );
}