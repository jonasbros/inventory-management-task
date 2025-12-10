import { useState, useEffect } from 'react';\nimport Head from 'next/head';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  TableContainer,
} from '@mui/material';
import { useRouter } from 'next/router';
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';
import StockLevelChart from './components/charts/StockLevelChart';
import InventoryValueChart from './components/charts/InventoryValueChart';
import WarehouseCapacityChart from './components/charts/WarehouseCapacityChart';
import FilterableInventoryTable from './components/FilterableInventoryTable';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  
  const router = useRouter();
  

  useEffect(() => {
    // Fetch all data
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/warehouses').then(res => res.json()),
      fetch('/api/stock').then(res => res.json()),
    ]).then(([productsData, warehousesData, stockData]) => {
      setProducts(productsData);
      setWarehouses(warehousesData);
      setStock(stockData);
    });
  }, []);

  // Process all dashboard data
  const { totalValue, valueByCategory, inventoryOverview, warehouseData } = useDashboardData(products, warehouses, stock);


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
          <FilterableInventoryTable
            inventoryOverview={inventoryOverview}
            products={products}
            warehouses={warehouses}
            showActions={true}
            showWarehouse={false}
            onEdit={handleEditProduct}
            onRestock={handleRestockProduct}
            title="Inventory Overview"
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
              metrics={useDashboardMetrics(products, warehouses, stock, inventoryOverview)}
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