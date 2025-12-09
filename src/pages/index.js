import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TableContainer,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/router';
import MetricCardsContainer from './components/dashboard/MetricCardsContainer';
import InventoryTable from './components/InventoryTable';

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
        <InventoryTable 
          data={inventoryOverview}
          products={products}
          warehouses={warehouses}
          showActions={true}
          showWarehouse={false}
          onEdit={handleEditProduct}
          onRestock={handleRestockProduct}
        />
      </TableContainer>
    </Container>
  );
}

