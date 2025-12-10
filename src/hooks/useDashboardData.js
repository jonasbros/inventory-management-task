import { useMemo } from 'react';

/**
 * Custom hook for dashboard data processing
 * Handles all calculations for inventory overview, totals, and categorization
 */
export function useDashboardData(products, warehouses, stock) {
  return useMemo(() => {
    // Calculate total inventory value
    const totalValue = calculateTotalValue(stock, products);
    
    // Calculate inventory value by category
    const valueByCategory = calculateValueByCategory(products, stock);
    
    // Get products with stock across all warehouses
    const inventoryOverview = createInventoryOverview(products, stock);

    return {
      totalValue,
      valueByCategory,
      inventoryOverview
    };
  }, [products, warehouses, stock]);
}

// Helper function: Calculate total inventory value
function calculateTotalValue(stock, products) {
  return stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.unitCost * item.quantity : 0);
  }, 0);
}

// Helper function: Calculate inventory value by category
function calculateValueByCategory(products, stock) {
  return products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    const totalProductValue = product.unitCost * totalQuantity;
    
    return {
      category: product.category,
      value: totalProductValue,
      productId: product.id
    };
  }).reduce((acc, item) => {
    // Group by category
    const existing = acc.find(cat => cat.name === item.category);
    if (existing) {
      existing.value += item.value;
      existing.productCount += 1;
    } else {
      acc.push({
        name: item.category,
        value: item.value,
        productCount: 1
      });
    }
    return acc;
  }, []).filter(cat => cat.value > 0);
}

// Helper function: Create inventory overview with stock status
function createInventoryOverview(products, stock) {
  return products.map(product => {
    const productStock = stock.filter(s => s.productId === product.id);
    const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
    
    // Find the lowest stock warehouse for this product
    const lowestStockWarehouse = findLowestStockWarehouse(productStock);
    
    return {
      ...product,
      totalQuantity,
      isLowStock: totalQuantity < product.reorderPoint,
      isCriticalStock: totalQuantity < product.reorderPoint * 0.5,
      isOutOfStock: totalQuantity === 0,
      lowestStockWarehouse,
      productStock,
    };
  });
}

// Helper function: Find warehouse with lowest stock for a product
function findLowestStockWarehouse(productStock) {
  return productStock.reduce((lowest, current) => {
    if (!lowest || current.quantity < lowest.quantity) {
      return current;
    }
    return lowest;
  }, null);
}