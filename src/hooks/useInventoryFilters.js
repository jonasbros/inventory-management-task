import { useState, useMemo } from 'react';

/**
 * Custom hook for managing inventory filtering logic
 * Handles search, category, stock status, and warehouse filters
 */
export function useInventoryFilters(inventoryOverview, products) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    stockStatus: 'all',
    warehouse: 'all'
  });

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))].sort();
  }, [products]);

  // Apply combined filters: search term + advanced filters
  const filteredInventory = useMemo(() => {
    return inventoryOverview.filter(item => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      
      // Stock status filter
      const matchesStockStatus = getStockStatusMatch(item, filters.stockStatus);
      
      // Warehouse filter (check if product has stock in selected warehouse)
      const matchesWarehouse = getWarehouseMatch(item, filters.warehouse);
      
      return matchesSearch && matchesCategory && matchesStockStatus && matchesWarehouse;
    });
  }, [inventoryOverview, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredInventory,
    uniqueCategories
  };
}

/**
 * Helper function to match stock status
 */
function getStockStatusMatch(item, stockStatus) {
  if (stockStatus === 'all') return true;
  if (stockStatus === 'out-of-stock') return item.isOutOfStock;
  if (stockStatus === 'critical-stock') return item.isCriticalStock;
  if (stockStatus === 'low-stock') return item.isLowStock && !item.isCriticalStock;
  if (stockStatus === 'well-stocked') return !item.isLowStock && !item.isCriticalStock && !item.isOutOfStock;
  return true;
}

/**
 * Helper function to match warehouse filter
 */
function getWarehouseMatch(item, warehouseFilter) {
  if (warehouseFilter === 'all') return true;
  return item.productStock.some(stock => stock.warehouseId === parseInt(warehouseFilter));
}