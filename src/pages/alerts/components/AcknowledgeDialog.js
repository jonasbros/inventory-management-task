import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';

export default function AcknowledgeDialog({
  open,
  onClose,
  selectedAlert,
  actionType,
  actionNotes,
  setActionNotes,
  submittingAction,
  onSubmit,
  stock,
  warehouses,
  products
}) {
  return (
    <Dialog 
      open={open} 
      onClose={() => !submittingAction && onClose()}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 1, lg: 3 }
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        {actionType === 'dismissed' ? 'Snooze Alert' : actionType.charAt(0).toUpperCase() + actionType.slice(1) + ' Alert'}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {selectedAlert && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedAlert.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAlert.recommendedAction}
              </Typography>
            </Box>
            
            {/* Warehouse-level breakdown */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Warehouse Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              {stock.filter(s => s.productId === selectedAlert.productId).map((stockItem, index) => {
                const warehouse = warehouses.find(w => w.id === stockItem.warehouseId);
                const product = products.find(p => p.id === selectedAlert.productId);
                const isLowStock = stockItem.quantity < (product?.reorderPoint || 0);
                const isCritical = stockItem.quantity < ((product?.reorderPoint || 0) * 0.5) || stockItem.quantity === 0;
                
                return (
                  <Paper key={index} sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: isCritical ? 'error.main' : isLowStock ? 'warning.main' : 'divider',
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 600,
                          color: isCritical ? 'error.light' : isLowStock ? 'warning.light' : undefined
                        }}>
                          {warehouse?.name || 'Unknown Warehouse'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current: {stockItem.quantity?.toLocaleString() || 0} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reorder point: {product?.reorderPoint?.toLocaleString() || 0} units
                        </Typography>
                      </Box>
                      <Chip
                        label={isCritical ? 'Critical' : isLowStock ? 'Low Stock' : 'Healthy'}
                        size="small"
                        color={isCritical ? 'error' : isLowStock ? 'warning' : 'success'}
                        variant="filled"
                      />
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
        <TextField
          fullWidth
          label="Notes (Optional)"
          multiline
          rows={3}
          value={actionNotes}
          onChange={(e) => setActionNotes(e.target.value)}
          placeholder={`Add notes about this ${actionType} action...`}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          disabled={submittingAction}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          disabled={submittingAction}
        >
          {submittingAction ? 'Processing...' : actionType === 'dismissed' ? 'Snooze Alert' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Alert`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}