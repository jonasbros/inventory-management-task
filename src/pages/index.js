import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
} from '@mui/material';
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';
import StockLevelChart from './components/charts/StockLevelChart';
import InventoryValueChart from './components/charts/InventoryValueChart';
import WarehouseCapacityChart from './components/charts/WarehouseCapacityChart';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  

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


  return (
    <Container sx={{ mt: 4, mb: 4 }}>
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <StockLevelChart 
            metrics={useDashboardMetrics(products, warehouses, stock, inventoryOverview)}
            stock={stock}
            products={products}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <InventoryValueChart 
            valueByCategory={valueByCategory}
            totalValue={totalValue}
          />
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <WarehouseCapacityChart 
            warehouseData={warehouseData}
          />
        </Grid>
      </Grid>
    </Container>
  );
}