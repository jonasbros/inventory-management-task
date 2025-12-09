import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/router';
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';

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

  // Calculate total inventory value
  const totalValue = stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.unitCost * item.quantity : 0);
  }, 0);

  // Get products with stock across all warehouses
  const inventoryOverview = products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    
    // Find the lowest stock warehouse for this product
    const lowestStockWarehouse = productStock.reduce((lowest, current) => {
      if (!lowest || current.quantity < lowest.quantity) {
        return current;
      }
      return lowest;
    }, null);
    
    return {
      ...product,
      totalQuantity,
      isLowStock: totalQuantity < product.reorderPoint,
      isCriticalStock: totalQuantity < product.reorderPoint * 0.5,
      isOutOfStock: totalQuantity === 0,
      lowestStockWarehouse, // For restock actions
      productStock, // All stock records for this product
    };
  });

  const handleEditProduct = (productId) => {
    router.push(`/products/edit/${productId}`);
  };

  const handleRestockProduct = (product) => {
    // Find the warehouse with lowest stock for restocking
    if (product.lowestStockWarehouse) {
      const stockRecord = product.lowestStockWarehouse;
      router.push(`/stock/edit/${stockRecord.id}?restock=true&currentQuantity=${stockRecord.quantity}`);
    }
  };


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
              <TableCell><strong>Actions</strong></TableCell>
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
                  <Typography 
                    variant="body2" 
                    fontWeight={item.isLowStock ? 600 : 400}
                    color={item.isOutOfStock ? 'error.main' : 
                           item.isCriticalStock ? 'warning.main' :
                           item.isLowStock ? 'warning.main' : 'text.primary'}
                  >
                    {item.totalQuantity.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {item.reorderPoint.toLocaleString()}
                  </Typography>
                </TableCell>
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
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditProduct(item.id)}
                    >
                      Edit
                    </Button>
                    {(item.isLowStock || item.isOutOfStock) && (
                      <Button
                        size="small"
                        variant="contained"
                        color={item.isOutOfStock ? "error" : "warning"}
                        onClick={() => handleRestockProduct(item)}
                        disabled={!item.lowestStockWarehouse}
                      >
                        Restock
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

