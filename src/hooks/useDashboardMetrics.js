import { useMemo } from 'react';

/**
 * Custom hook for dashboard metrics calculations
 * Clean, memoized calculations with helper functions
 */
export function useDashboardMetrics(products, warehouses, stock, inventoryOverview) {
  return useMemo(() => {
    // Calculate stock incidents
    const lowStockIncidents = getStockIncidents(stock, products, isLowStock);
    const criticalStockIncidents = getStockIncidents(stock, products, isCriticalStock);
    const zeroStockIncidents = getStockIncidents(stock, products, isZeroStock);

    // Calculate warehouse counts
    const warehousesWithLowStock = getUniqueWarehouses(lowStockIncidents);
    const warehousesWithZeroStock = getUniqueWarehouses(zeroStockIncidents);

    // Calculate product-level metrics
    const outOfStockCount = countByStatus(inventoryOverview, item => item.isOutOfStock);
    const healthyStockCount = countByStatus(inventoryOverview, item => !item.isLowStock);

    // Count unique products with issues (for consistent card display)
    const uniqueProductsWithLowStock = new Set(lowStockIncidents.map(item => item.productId)).size;
    const uniqueProductsWithCriticalStock = new Set(criticalStockIncidents.map(item => item.productId)).size;

    return {
      // Product metrics
      totalProducts: products.length,
      healthyStockCount,
      
      // Warehouse metrics
      totalWarehouses: warehouses.length,
      
      // Product-level stock alert metrics (unique products)
      lowStockCount: uniqueProductsWithLowStock,
      criticalStockCount: uniqueProductsWithCriticalStock,
      outOfStockCount,
      
      // Warehouse-level metrics
      warehouseLowStockCount: warehousesWithLowStock.size,
      warehouseZeroStockCount: warehousesWithZeroStock.size,
      
      // Raw data for modals (warehouse incidents)
      lowStockIncidents,
      criticalStockIncidents,
      warehousesWithZeroStock,
      warehousesWithLowStock
    };
  }, [products, warehouses, stock, inventoryOverview]);
}

// Helper functions for stock calculations
function findProduct(products, productId) {
  return products.find(p => p.id === productId);
}

function isLowStock(quantity, reorderPoint) {
  return quantity > 0 && quantity < reorderPoint;
}

function isCriticalStock(quantity, reorderPoint) {
  return quantity > 0 && quantity < reorderPoint * 0.5;
}

function isZeroStock(quantity) {
  return quantity === 0;
}

// Stock analysis functions
function getStockIncidents(stock, products, filterFn) {
  return stock.filter(item => {
    const product = findProduct(products, item.productId);
    return product && filterFn(item.quantity, product.reorderPoint);
  });
}

function getUniqueWarehouses(stockIncidents) {
  return new Set(stockIncidents.map(item => item.warehouseId));
}

function countByStatus(inventory, statusFn) {
  return inventory.filter(statusFn).length;
}