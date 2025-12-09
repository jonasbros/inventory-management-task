import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MetricCard from './components/MetricCard';

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

  // Calculate total inventory value
  const totalValue = stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.unitCost * item.quantity : 0);
  }, 0);

  // Get products with stock across all warehouses
  const inventoryOverview = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    return {
      ...product,
      totalQuantity,
      isLowStock: totalQuantity < product.reorderPoint,
      isCriticalStock: totalQuantity < product.reorderPoint * 0.5,
      isOutOfStock: totalQuantity === 0,
    };
  });

  // Calculate KPIs
  const lowStockCount = inventoryOverview.filter(item => item.isLowStock && !item.isOutOfStock).length;
  const criticalStockCount = inventoryOverview.filter(item => item.isCriticalStock && !item.isOutOfStock).length;
  const outOfStockCount = inventoryOverview.filter(item => item.isOutOfStock).length;
  const healthyStockCount = inventoryOverview.filter(item => !item.isLowStock).length;

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Enhanced Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Products"
            value={products.length}
            icon={CategoryIcon}
            subtitle={`${healthyStockCount} healthy stock`}
            subtitleIcon={TrendingUpIcon}
            subtitleColor="success.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Inventory Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={InventoryIcon}
            subtitle={`${warehouses.length} warehouses`}
            subtitleIcon={WarehouseIcon}
            subtitleColor="primary.main"
            iconColor="primary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={WarningIcon}
            iconColor="warning.main"
            valueColor={lowStockCount > 0 ? 'warning.main' : 'text.primary'}
            chip={
              <Chip 
                label={`${criticalStockCount} critical`} 
                size="small" 
                color={criticalStockCount > 0 ? "error" : "default"}
                variant="outlined"
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Out of Stock"
            value={outOfStockCount}
            icon={ErrorIcon}
            iconColor="error.main"
            valueColor={outOfStockCount > 0 ? 'error.main' : 'text.primary'}
            subtitle="Immediate action required"
            subtitleColor="error.light"
          />
        </Grid>
      </Grid>

      {/* Inventory Overview Table */}
      <Typography variant="h5" gutterBottom>
        Inventory Overview
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>SKU</strong></TableCell>
              <TableCell><strong>Product Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell align="right"><strong>Total Stock</strong></TableCell>
              <TableCell align="right"><strong>Reorder Point</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryOverview.map((item) => (
              <TableRow 
                key={item.id}
                sx={{ 
                  backgroundColor: item.isOutOfStock ? '#ffebee' : 
                                   item.isCriticalStock ? '#fff3e0' :
                                   item.isLowStock ? '#fff8e1' : 'inherit' 
                }}
              >
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {item.totalQuantity}
                    <Box sx={{ ml: 1, width: 60 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((item.totalQuantity / (item.reorderPoint * 2)) * 100, 100)}
                        color={item.isOutOfStock ? 'error' : 
                               item.isCriticalStock ? 'warning' :
                               item.isLowStock ? 'warning' : 'success'}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">{item.reorderPoint}</TableCell>
                <TableCell>
                  {item.isOutOfStock ? (
                    <Chip label="Out of Stock" color="error" size="small" />
                  ) : item.isCriticalStock ? (
                    <Chip label="Critical" color="error" size="small" variant="outlined" />
                  ) : item.isLowStock ? (
                    <Chip label="Low Stock" color="warning" size="small" />
                  ) : (
                    <Chip label="In Stock" color="success" size="small" variant="outlined" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

