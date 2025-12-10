import { useState, useMemo } from 'react';

/**
 * Custom hook for managing inventory filtering, sorting, and pagination logic
 * Handles search, category, stock status, warehouse filters, sorting, and pagination
 */
export function useInventoryFilters(inventoryOverview, products, { defaultPageSize = 10 } = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    stockStatus: 'all',
    warehouse: 'all'
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
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

  // Apply sorting
  const sortedInventory = useMemo(() => {
    if (!sortConfig.key) return filteredInventory;

    return [...filteredInventory].sort((a, b) => {
      const aVal = getSortValue(a, sortConfig.key);
      const bVal = getSortValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInventory, sortConfig]);

  // Apply pagination
  const paginatedInventory = useMemo(() => {
    const startIndex = page * pageSize;
    return sortedInventory.slice(startIndex, startIndex + pageSize);
  }, [sortedInventory, page, pageSize]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(0); // Reset to first page when sorting
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredInventory,
    sortedInventory,
    paginatedInventory,
    uniqueCategories,
    // Pagination state
    page,
    pageSize,
    totalItems: sortedInventory.length,
    totalPages: Math.ceil(sortedInventory.length / pageSize),
    // Sorting state
    sortConfig,
    // Handlers
    handleSort,
    handlePageChange,
    handlePageSizeChange
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

/**
 * Helper function to get sortable value for a given key
 */
function getSortValue(item, key) {
  switch (key) {
    case 'name':
      return item.name?.toLowerCase() || '';
    case 'sku':
      return item.sku?.toLowerCase() || '';
    case 'category':
      return item.category?.toLowerCase() || '';
    case 'totalQuantity':
    case 'stock':
      return item.totalQuantity || 0;
    case 'reorderPoint':
      return item.reorderPoint || 0;
    case 'unitCost':
      return item.unitCost || 0;
    case 'status':
      // Sort by severity: out of stock > critical > low > well stocked
      if (item.isOutOfStock) return 0;
      if (item.isCriticalStock) return 1;
      if (item.isLowStock) return 2;
      return 3;
    default:
      return '';
  }
}