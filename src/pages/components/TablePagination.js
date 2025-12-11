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
      alignItems: { xs: 'flex-start', md: 'center' }, 
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', md: 'row' },
      p: { xs: 1.5, md: 2 },
      borderTop: '1px solid',
      borderColor: 'divider',
      flexWrap: 'wrap',
      gap: { xs: 1.5, md: 2 }
    }}>
      {/* Items per page selector */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, md: 2 },
        width: { xs: '100%', md: 'auto' },
        justifyContent: { xs: 'space-between', md: 'flex-start' }
      }}>
        <FormControl size="small" sx={{ minWidth: { xs: 70, md: 80 } }}>
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
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
        >
          {startItem}-{endItem} of {totalItems} items
        </Typography>
      </Box>

      {/* Pagination controls */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 0.5, md: 1 },
        width: { xs: '100%', md: 'auto' },
        justifyContent: { xs: 'center', md: 'flex-start' }
      }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mr: 2, 
            fontSize: '0.75rem',
            display: { xs: 'none', md: 'block' }
          }}
        >
          Page {page + 1} of {totalPages}
        </Typography>
        
        <IconButton 
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          size="small"
        >
          <FirstPage sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
        </IconButton>
        
        <IconButton 
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          size="small"
        >
          <NavigateBefore sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
        </IconButton>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mx: 1, 
            fontSize: '0.75rem', 
            minWidth: 'fit-content',
            display: { xs: 'block', md: 'none' }
          }}
        >
          {page + 1}/{totalPages}
        </Typography>
        
        <IconButton 
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          size="small"
        >
          <NavigateNext sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
        </IconButton>
        
        <IconButton 
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          size="small"
        >
          <LastPage sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
        </IconButton>
      </Box>
    </Box>
  );
}