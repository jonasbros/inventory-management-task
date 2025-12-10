import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import { useRouter } from 'next/router';
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';
import StockLevelChart from './components/charts/StockLevelChart';
import InventoryValueChart from './components/charts/InventoryValueChart';
import WarehouseCapacityChart from './components/charts/WarehouseCapacityChart';
import AppTable from './components/AppTable';
import { 
  getInventoryColumns, 
  getEditAction, 
  getRestockAction, 
  getCategoryFilter,
  getStatusFilter
} from '../utils/tableColumns';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useDashboardData } from '../hooks/useDashboardData';
import { useNotification } from '../contexts/NotificationContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const { showError } = useNotification();
  

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const responses = await Promise.all([
        fetch('/api/products'),
        fetch('/api/warehouses'),
        fetch('/api/stock'),
      ]);

      // Check for HTTP errors
      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['products', 'warehouses', 'stock'];
          throw new Error(`Failed to load ${endpoints[index]}: ${response.status} ${response.statusText}`);
        }
      });

      const [productsData, warehousesData, stockData] = await Promise.all(
        responses.map(res => res.json())
      );

      setProducts(productsData);
      setWarehouses(warehousesData);
      setStock(stockData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      const errorMessage = err.message || 'Failed to load dashboard data. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process all dashboard data
  const { totalValue, valueByCategory, inventoryOverview, warehouseData } = useDashboardData(products, warehouses, stock);
  const dashboardMetrics = useDashboardMetrics(products, warehouses, stock, inventoryOverview);

  const handleEditProduct = (item) => {
    router.push(`/products/edit/${item.id}`);
  };

  const handleRestockProduct = (product) => {
    // Find the warehouse with lowest stock for restocking
    if (product.lowestStockWarehouse) {
      const stockRecord = product.lowestStockWarehouse;
      router.push(`/stock/edit/${stockRecord.id}?restock=true&currentQuantity=${stockRecord.quantity}`);
    }
  };


  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={fetchData}
        title="Error Loading Dashboard"
      />
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - GreenSupply Co</title>
        <meta name="description" content="Inventory management dashboard for GreenSupply Co warehouse operations" />
      </Head>
      
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

      {/* Dashboard Metrics */}
      <MetricCardsContainer 
        products={products}
        warehouses={warehouses}
        stock={stock}
        totalValue={totalValue}
        inventoryOverview={inventoryOverview}
      />

      {/* Main Content Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left Side - Tables and Bar Chart */}
        <Grid item xs={12} lg={8}>
          {/* Inventory Overview Table */}
          <AppTable
            data={inventoryOverview}
            columns={getInventoryColumns(products, warehouses)}
            title="Inventory Overview"
            searchable={true}
            filterable={true}
            sortable={true}
            paginated={true}
            filters={[
              getCategoryFilter(inventoryOverview),
              getStatusFilter()
            ]}
            actions={[
              getEditAction((item) => `/products/edit/${item.id}`),
              getRestockAction(handleRestockProduct)
            ]}
            emptyMessage="No inventory data available."
          />

          {/* Warehouse Capacity Chart */}
          <WarehouseCapacityChart 
            warehouseData={warehouseData}
          />
        </Grid>

        {/* Right Side - Pie Charts */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <StockLevelChart 
              metrics={dashboardMetrics}
              stock={stock}
              products={products}
            />
            <InventoryValueChart 
              valueByCategory={valueByCategory}
              totalValue={totalValue}
            />
          </Box>
        </Grid>
      </Grid>
      </Container>
    </>
  );
}