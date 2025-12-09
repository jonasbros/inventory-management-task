import {
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Paper,
  IconButton,
  Typography,
  Box,
  TablePagination,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import InventoryTable from '../InventoryTable';

export default function StockDetailsModal({ 
  open, 
  onClose, 
  title, 
  stockData, 
  products, 
  warehouses,
  onEdit,
  onRestock
}) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset page when modal opens with new data
  useEffect(() => {
    setPage(0);
  }, [stockData]);

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = stockData.slice(startIndex, endIndex);

  const handleEdit = (productId, warehouseId) => {
    if (onEdit) {
      onEdit(productId, warehouseId);
    } else {
      // Navigate to product edit page
      router.push(`/products/edit/${productId}`);
      onClose(); // Close modal after navigation
    }
  };

  const handleRestock = (productId, warehouseId) => {
    if (onRestock) {
      onRestock(productId, warehouseId);
    } else {
      // Find the existing stock record to update
      const stockItem = stockData.find(item => 
        item.productId === productId && item.warehouseId === warehouseId
      );
      
      if (stockItem) {
        // Navigate to stock edit page with restock context
        router.push(`/stock/edit/${stockItem.id}?restock=true&currentQuantity=${stockItem.quantity}`);
        onClose(); // Close modal after navigation
      }
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          height: 'auto',
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, overflow: 'hidden' }}>
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            maxHeight: '60vh',
            overflow: 'auto',
            '& .MuiTable-root': {
              '& .MuiTableCell-root': {
                padding: '12px 16px',
                whiteSpace: 'nowrap'
              },
              '& .MuiTableCell-head': {
                fontWeight: 600,
                backgroundColor: 'grey.50'
              }
            }
          }}
        >
          <InventoryTable 
            data={paginatedData}
            products={products}
            warehouses={warehouses}
            showActions={true}
            showWarehouse={true}
            size="small"
            stickyHeader={true}
            onEdit={(item) => handleEdit(item.productId, item.warehouseId)}
            onRestock={(item) => handleRestock(item.productId, item.warehouseId)}
          />
        </TableContainer>
        
        {/* Pagination outside of scrollable area */}
        {stockData.length > 0 && (
          <TablePagination
            component="div"
            count={stockData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        )}
        
        {stockData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, px: 4 }}>
            {title.includes('Low Stock') ? (
              <>
                <Typography variant="h6" color="success.main" gutterBottom>
                  🎉 All Products Well-Stocked!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No low stock alerts at this time. All products are above their reorder points.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Keep monitoring inventory levels to maintain healthy stock.
                </Typography>
              </>
            ) : title.includes('Out of Stock') ? (
              <>
                <Typography variant="h6" color="success.main" gutterBottom>
                  All Warehouses Stocked!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No out of stock items found. All products are available in warehouses.
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No items to display
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}