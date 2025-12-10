import { 
  Box, 
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Divider,
  Chip,
  Badge
} from '@mui/material';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FilterDropdown({ 
  filters, 
  onFiltersChange, 
  categories = [], 
  warehouses = [] 
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const stockStatusOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'well-stocked', label: 'Well Stocked' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'critical-stock', label: 'Critical Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      category: 'all',
      stockStatus: 'all',
      warehouse: 'all'
    });
    handleClose();
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.stockStatus !== 'all', 
    filters.warehouse !== 'all'
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Box sx={{ display: 'inline-block' }}>
      <Badge badgeContent={activeFilterCount} color="primary">
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={handleClick}
          sx={{ 
            mb: 2,
            height: '56px', // Match TextField height
            minWidth: '120px',
            color: hasActiveFilters ? 'primary.main' : 'text.secondary',
            borderColor: hasActiveFilters ? 'primary.main' : 'divider',
            '& .MuiBadge-root': {
              height: '100%'
            }
          }}
        >
          Filters
        </Button>
      </Badge>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            minWidth: 320,
            maxWidth: 400,
            p: 2
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Filter Options
            </Typography>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                color="primary"
              >
                Clear All
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Category Filter */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel size="small">Category</InputLabel>
            <Select
              size="small"
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Stock Status Filter */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel size="small">Stock Status</InputLabel>
            <Select
              size="small"
              value={filters.stockStatus}
              label="Stock Status"
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            >
              {stockStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Warehouse Filter */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel size="small">Warehouse</InputLabel>
            <Select
              size="small"
              value={filters.warehouse}
              label="Warehouse"
              onChange={(e) => handleFilterChange('warehouse', e.target.value)}
            >
              <MenuItem value="all">All Warehouses</MenuItem>
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Active filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.category !== 'all' && (
                  <Chip
                    label={filters.category}
                    size="small"
                    onDelete={() => handleFilterChange('category', 'all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.stockStatus !== 'all' && (
                  <Chip
                    label={stockStatusOptions.find(opt => opt.value === filters.stockStatus)?.label}
                    size="small"
                    onDelete={() => handleFilterChange('stockStatus', 'all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.warehouse !== 'all' && (
                  <Chip
                    label={warehouses.find(w => w.id === filters.warehouse)?.name}
                    size="small"
                    onDelete={() => handleFilterChange('warehouse', 'all')}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </>
          )}
        </Box>
      </Menu>
    </Box>
  );
}