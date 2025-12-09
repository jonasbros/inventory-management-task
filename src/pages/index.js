import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
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
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';

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

