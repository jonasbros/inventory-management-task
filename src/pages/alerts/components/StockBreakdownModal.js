import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper
} from '@mui/material';

export default function StockBreakdownModal({
  open,
  onClose,
  selectedAlertForStock,
  stock
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Stock Breakdown - {selectedAlertForStock?.productName}
      </DialogTitle>
      <DialogContent>
        {selectedAlertForStock && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Current stock levels across warehouses for this product
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedAlertForStock.stockByWarehouse?.map((warehouse, index) => (
                <Paper key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'start', md: 'center'}, gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {warehouse.warehouseName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current stock: {warehouse.quantity?.toLocaleString() || 0} units
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reorder point: {selectedAlertForStock.reorderPoint?.toLocaleString()} units
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          window.location.href = `/transfers/add?productId=${selectedAlertForStock.productId}&toWarehouseId=${warehouse.warehouseId}`;
                        }}
                      >
                        Request Transfer
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          const stockRecord = stock.find(s => 
                            s.productId === selectedAlertForStock.productId && 
                            s.warehouseId === warehouse.warehouseId
                          );
                          if (stockRecord) {
                            window.location.href = `/stock/edit/${stockRecord.id}?restock=true&currentQuantity=${stockRecord.quantity}`;
                          } else {
                            window.location.href = `/stock/add?productId=${selectedAlertForStock.productId}&warehouseId=${warehouse.warehouseId}`;
                          }
                        }}
                      >
                        Add Stock
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}