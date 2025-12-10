import {
  Box,
  Typography,
  TableContainer,
  Paper
} from '@mui/material';
import SearchBox from './SearchBox';
import FilterDropdown from './FilterDropdown';
import InventoryTable from './InventoryTable';
import TablePagination from './TablePagination';
import { useInventoryFilters } from '../../hooks/useInventoryFilters';

export default function FilterableInventoryTable({
  inventoryOverview,
  products,
  warehouses,
  showActions = true,
  showWarehouse = false,
  size = "medium",
  stickyHeader = false,
  onEdit,
  onRestock,
  title = "Inventory Overview",
  enablePagination = true,
  defaultPageSize = 10
}) {
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredInventory,
    paginatedInventory,
    uniqueCategories,
    // Pagination state
    page,
    pageSize,
    totalItems,
    totalPages,
    // Sorting state
    sortConfig,
    // Handlers
    handleSort,
    handlePageChange,
    handlePageSizeChange
  } = useInventoryFilters(inventoryOverview, products, { defaultPageSize });
  
  // Use paginated data if pagination is enabled, otherwise use filtered data
  const displayData = enablePagination ? paginatedInventory : filteredInventory;

  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
        <SearchBox
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product name, SKU, or category..."
          sx={{ flexGrow: 1, mb: 0 }}
        />
        <FilterDropdown
          filters={filters}
          onFiltersChange={setFilters}
          categories={uniqueCategories}
          warehouses={warehouses}
        />
      </Box>
      
      <TableContainer component={Paper} sx={{ mb: enablePagination ? 0 : 3 }}>
        {displayData.length > 0 ? (
          <InventoryTable 
            data={displayData}
            products={products}
            warehouses={warehouses}
            showActions={showActions}
            showWarehouse={showWarehouse}
            size={size}
            stickyHeader={stickyHeader}
            onEdit={onEdit}
            onRestock={onRestock}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or filters to see more results.
            </Typography>
          </Box>
        )}
        
        {enablePagination && displayData.length > 0 && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </TableContainer>
      
      {enablePagination && displayData.length === 0 && (
        <Box sx={{ mb: 3 }} />
      )}
    </Box>
  );
}