import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TableSortLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TablePagination from './TablePagination';

/**
 * Universal Data Table Component
 * Reusable table with search, filter, sorting, and pagination
 * 
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Column configuration array
 * @param {Object} options - Table configuration options
 */
export default function AppTable({
  data = [],
  columns = [],
  title = "Data Table",
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  size = "medium",
  stickyHeader = false,
  onRowClick,
  emptyMessage = "No data available.",
  filters = [], // Array of filter configurations
  actions = [], // Array of action button configurations
}) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  // Search functionality
  const searchableData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(column => {
        const value = column.accessor ? column.accessor(item) : item[column.key];
        return String(value || '').toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchTerm, columns, searchable]);

  // Filter functionality
  const filteredData = useMemo(() => {
    let filtered = searchableData;
    
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        const filterConfig = filters.find(f => f.key === filterKey);
        if (filterConfig && filterConfig.accessor) {
          filtered = filtered.filter(item => 
            filterConfig.accessor(item) === filterValue
          );
        }
      }
    });
    
    return filtered;
  }, [searchableData, activeFilters, filters]);

  // Sorting functionality
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;
      
      const aValue = column.accessor ? column.accessor(a) : a[column.key];
      const bValue = column.accessor ? column.accessor(b) : b[column.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredData, sortConfig, columns, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const startIndex = page * currentPageSize;
    return sortedData.slice(startIndex, startIndex + currentPageSize);
  }, [sortedData, page, currentPageSize, paginated]);

  // Event handlers
  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => ({
      key: columnKey,
      direction: prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setPage(0); // Reset to first page
  };

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPage(0); // Reset to first page when filtering
  };

  // Generate filter options
  const getFilterOptions = (filterConfig) => {
    if (!filterConfig.accessor || typeof filterConfig.accessor !== 'function') {
      return [{ value: 'all', label: 'All' }];
    }
    
    const uniqueValues = [...new Set(
      data.map(item => filterConfig.accessor(item)).filter(Boolean)
    )].sort();
    
    return [
      { value: 'all', label: 'All' },
      ...uniqueValues.map(value => ({ value, label: value }))
    ];
  };

  // Render sortable table cell header
  const SortableTableCell = ({ column, children, ...props }) => {
    if (!sortable || !column.sortable) {
      return (
        <TableCell {...props}>
          <strong>{children}</strong>
        </TableCell>
      );
    }

    return (
      <TableCell {...props}>
        <TableSortLabel
          active={sortConfig.key === column.key}
          direction={sortConfig.key === column.key ? sortConfig.direction : 'asc'}
          onClick={() => handleSort(column.key)}
        >
          <strong>{children}</strong>
        </TableSortLabel>
      </TableCell>
    );
  };

  // Calculate pagination values
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);

  return (
    <Box>
      {/* Title */}
      <Typography 
        variant={{ xs: "subtitle1", md: "h6" }} 
        component="h2" 
        gutterBottom
        sx={{ 
          mb: { xs: 2, md: 3 },
          fontWeight: 600
        }}
      >
        {title}
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ 
        mb: { xs: 2, md: 3 }, 
        display: 'flex', 
        gap: { xs: 1, md: 2 }, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' }
      }}>
        {/* Search */}
        {searchable && (
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: '100%', md: 250 },
              width: { xs: '100%', md: 'auto' }
            }}
          />
        )}

        {/* Filters */}
        {filterable && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 2 }, 
            flexWrap: 'wrap',
            width: { xs: '100%', md: 'auto' }
          }}>
            {filters.map(filter => (
              <FormControl 
                key={filter.key} 
                size="small" 
                sx={{ 
                  minWidth: { xs: 'calc(50% - 4px)', md: 150 },
                  flex: { xs: '1 1 calc(50% - 4px)', md: '0 0 auto' }
                }}
              >
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={activeFilters[filter.key] || 'all'}
                  label={filter.label}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                >
                  {getFilterOptions(filter).map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        )}

        {/* Active filter chips */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          width: { xs: '100%', md: 'auto' }
        }}>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            const filter = filters.find(f => f.key === key);
            return (
              <Chip
                key={key}
                label={`${filter?.label}: ${value}`}
                size="small"
                onDelete={() => handleFilterChange(key, 'all')}
                color="primary"
                variant="outlined"
              />
            );
          })}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 800, md: 'auto' }
          },
          mb: { xs: 1, md: 2 }
        }}
      >
        <Table size="small" stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <SortableTableCell 
                  key={column.key}
                  column={column}
                  align={column.align || 'left'}
                  sx={column.headerSx}
                >
                  {column.label}
                </SortableTableCell>
              ))}
              {actions.length > 0 && (
                <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 120 }}>
                  <strong>Actions</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow 
                key={item.id || index}
                onClick={() => onRowClick?.(item)}
                sx={{ 
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {}
                }}
              >
                {columns.map((column) => {
                  let value;
                  try {
                    value = column.accessor ? column.accessor(item) : item[column.key];
                  } catch (error) {
                    console.error('Error accessing column value:', error, column, item);
                    value = '';
                  }
                  
                  let displayValue;
                  try {
                    displayValue = column.render ? column.render(value, item) : value;
                  } catch (error) {
                    console.error('Error rendering column:', error, column, value, item);
                    displayValue = String(value || '');
                  }
                  
                  return (
                    <TableCell 
                      key={column.key} 
                      align={column.align || 'left'}
                      sx={column.cellSx}
                    >
                      {displayValue !== null && displayValue !== undefined ? displayValue : '-'}
                    </TableCell>
                  );
                })}
                {actions.length > 0 && (
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {actions.map((action, actionIndex) => (
                        <span key={actionIndex}>
                          {typeof action === 'function' ? action(item) : action.render(item, actionIndex)}
                        </span>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {paginated && totalItems > 0 && (
        <TablePagination
          page={page}
          pageSize={currentPageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </Box>
  );
}