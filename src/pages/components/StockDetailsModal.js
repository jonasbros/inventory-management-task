import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Box,
  Button,
  TablePagination,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

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
      
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer 
          component={Paper} 
          variant="outlined"
          sx={{ 
            maxHeight: '60vh',
            overflow: 'auto'
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>Warehouse</strong></TableCell>
                <TableCell align="right"><strong>Current Stock</strong></TableCell>
                <TableCell align="right"><strong>Reorder Point</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item) => {
                const product = products.find(p => p.id === item.productId);
                const warehouse = warehouses.find(w => w.id === item.warehouseId);
                const isCritical = item.quantity < (product?.reorderPoint * 0.5);
                const isOutOfStock = item.quantity === 0;
                
                return (
                  <TableRow key={`${item.productId}-${item.warehouseId}`}>
                    <TableCell>{product?.name}</TableCell>
                    <TableCell>{product?.sku}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {warehouse?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {warehouse?.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        color={isOutOfStock ? 'error.main' : isCritical ? 'warning.main' : 'text.primary'}
                        fontWeight={isOutOfStock || isCritical ? 600 : 400}
                      >
                        {item.quantity.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {product?.reorderPoint?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {isOutOfStock ? (
                        <Chip label="Out of Stock" color="error" size="small" />
                      ) : isCritical ? (
                        <Chip label="Critical" color="error" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Low Stock" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(item.productId, item.warehouseId)}
                          sx={{ minWidth: 'auto' }}
                        >
                          Edit
                        </Button>
                        {(isOutOfStock || isCritical || item.quantity < product?.reorderPoint) && (
                          <Button
                            size="small"
                            variant="contained"
                            color={isOutOfStock ? "error" : "warning"}
                            onClick={() => handleRestock(item.productId, item.warehouseId)}
                            sx={{ minWidth: 'auto' }}
                          >
                            Restock
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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