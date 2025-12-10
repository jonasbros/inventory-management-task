import {
  Box,
  Typography,
  TableContainer,
  Paper
} from '@mui/material';
import SearchBox from './SearchBox';
import FilterDropdown from './FilterDropdown';
import InventoryTable from './InventoryTable';
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
  title = "Inventory Overview"
}) {
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredInventory,
    uniqueCategories
  } = useInventoryFilters(inventoryOverview, products);

  return (
    <Box>
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
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        {filteredInventory.length > 0 ? (
          <InventoryTable 
            data={filteredInventory}
            products={products}
            warehouses={warehouses}
            showActions={showActions}
            showWarehouse={showWarehouse}
            size={size}
            stickyHeader={stickyHeader}
            onEdit={onEdit}
            onRestock={onRestock}
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
      </TableContainer>
    </Box>
  );
}