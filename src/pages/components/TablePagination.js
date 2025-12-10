import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';

export default function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50]
}) {
  const startItem = totalItems === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalItems);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      p: 2,
      borderTop: '1px solid',
      borderColor: 'divider',
      flexWrap: 'wrap',
      gap: 2
    }}>
      {/* Items per page selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Rows</InputLabel>
          <Select
            value={pageSize}
            label="Rows"
            onChange={(e) => onPageSizeChange(e.target.value)}
          >
            {pageSizeOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          {startItem}-{endItem} of {totalItems} items
        </Typography>
      </Box>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Page {page + 1} of {totalPages}
        </Typography>
        
        <IconButton 
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          size="small"
        >
          <FirstPage />
        </IconButton>
        
        <IconButton 
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          size="small"
        >
          <NavigateBefore />
        </IconButton>
        
        <IconButton 
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          size="small"
        >
          <NavigateNext />
        </IconButton>
        
        <IconButton 
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          size="small"
        >
          <LastPage />
        </IconButton>
      </Box>
    </Box>
  );
}