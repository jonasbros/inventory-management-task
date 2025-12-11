import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import AppTable from '../components/AppTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useAlertData } from '../../hooks/useAlertData';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useNotification } from '../../contexts/NotificationContext';



export default function AlertsPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stock, setStock] = useState([]);
  const [alertActions, setAlertActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedAlertForStock, setSelectedAlertForStock] = useState(null);

  const { showSuccess, showError } = useNotification();

  // Define alert columns for product-level alerts
  const alertColumns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      accessor: (item) => item.productName
    },
    {
      key: 'productCategory', 
      label: 'Category',
      sortable: true,
      accessor: (item) => item.productCategory
    },
    {
      key: 'currentStock',
      label: 'Total Stock',
      sortable: true,
      accessor: (item) => item.currentStock,
      render: (value) => value?.toLocaleString() || '0'
    },
    {
      key: 'reorderPoint',
      label: 'Reorder Point', 
      sortable: true,
      accessor: (item) => item.reorderPoint,
      render: (value) => value?.toLocaleString() || '0'
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      accessor: (item) => {
        const productStock = stock.filter(s => s.productId === item.productId);
        const product = products.find(p => p.id === item.productId);
        
        let hasCritical = false;
        let hasLow = false;
        
        productStock.forEach(s => {
          if (s.quantity === 0 || s.quantity < ((product?.reorderPoint || 0) * 0.5)) {
            hasCritical = true;
          } else if (s.quantity < (product?.reorderPoint || 0)) {
            hasLow = true;
          }
        });
        
        if (hasCritical) return 'critical';
        if (hasLow) return 'low';
        if (item.severity === 'overstocked') return 'overstocked';
        return 'adequate';
      },
      render: (value) => (
        <Chip
          label={value?.charAt(0)?.toUpperCase() + value?.slice(1) || 'Unknown'}
          size="small"
          color={
            value === 'critical' ? 'error' : 
            value === 'low' ? 'warning' : 
            value === 'overstocked' ? 'info' : 
            value === 'adequate' ? 'success' : 'default'
          }
          variant="outlined"
        />
      )
    },
    {
      key: 'warehouseStatus',
      label: 'Warehouse Status',
      sortable: true,
      accessor: (item) => {
        const productStock = stock.filter(s => s.productId === item.productId);
        const product = products.find(p => p.id === item.productId);
        const criticalCount = productStock.filter(s => s.quantity === 0 || s.quantity < ((product?.reorderPoint || 0) * 0.5)).length;
        const lowStockCount = productStock.filter(s => s.quantity > 0 && s.quantity < (product?.reorderPoint || 0)).length;
        
        if (criticalCount > 0) return 'critical';
        if (lowStockCount > 0) return 'warning';
        return 'healthy';
      },
      render: (value, item) => {
        const productStock = stock.filter(s => s.productId === item.productId);
        const product = products.find(p => p.id === item.productId);
        const criticalCount = productStock.filter(s => s.quantity === 0 || s.quantity < ((product?.reorderPoint || 0) * 0.5)).length;
        const lowStockCount = productStock.filter(s => s.quantity > 0 && s.quantity < (product?.reorderPoint || 0)).length;
        const totalWarehouses = productStock.length;
        
        if (criticalCount > 0) {
          return (
            <Chip
              label={`${criticalCount}/${totalWarehouses} critical`}
              size="small"
              color="error"
              variant="filled"
            />
          );
        }
        if (lowStockCount > 0) {
          return (
            <Chip
              label={`${lowStockCount}/${totalWarehouses} low`}
              size="small"
              color="warning"
              variant="filled"
            />
          );
        }
        return (
          <Chip
            label={`${totalWarehouses}/${totalWarehouses} healthy`}
            size="small"
            color="success"
            variant="filled"
          />
        );
      }
    },
    {
      key: 'recommendedAction',
      label: 'Recommended Action',
      sortable: false,
      accessor: (item) => item.recommendedAction
    },
    {
      key: 'isAcknowledged',
      label: 'Status',
      sortable: true,
      accessor: (item) => item.isAcknowledged,
      render: (value, item) => (
        <Chip
          label={item.isDismissed ? 'Snoozed' : value ? 'Acknowledged' : 'New'}
          size="small"
          color={item.isDismissed ? 'default' : value ? 'success' : 'warning'}
          variant="filled"
        />
      )
    }
  ];

  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const responses = await Promise.all([
        fetch('/api/products'),
        fetch('/api/warehouses'),
        fetch('/api/stock'),
        fetch('/api/alerts'),
      ]);

      responses.forEach((response, index) => {
        if (!response.ok) {
          const endpoints = ['products', 'warehouses', 'stock', 'alerts'];
          throw new Error(`Failed to load ${endpoints[index]}: ${response.status} ${response.statusText}`);
        }
      });

      const [productsData, warehousesData, stockData, alertActionsData] = await Promise.all(
        responses.map(res => res.json())
      );

      setProducts(productsData);
      setWarehouses(warehousesData);
      setStock(stockData);
      setAlertActions(alertActionsData);
    } catch (err) {
      console.error('Alerts data fetch error:', err);
      const errorMessage = err.message || 'Failed to load alerts data. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const alertData = useAlertData(products, stock, warehouses, alertActions);
  const { inventoryOverview } = useDashboardData(products, warehouses, stock);
  const dashboardMetrics = useDashboardMetrics(products, warehouses, stock, inventoryOverview);

  // Create filters for product-level alerts
  const severityFilter = {
    key: 'severity',
    label: 'Severity',
    accessor: (item) => item.severity,
    options: [
      { value: 'all', label: 'All Severities' },
      { value: 'critical', label: 'Critical' },
      { value: 'low', label: 'Low Stock' },
      { value: 'overstocked', label: 'Overstocked' },
      { value: 'adequate', label: 'Adequate' }
    ]
  };

  const statusFilter = {
    key: 'status',
    label: 'Status',
    accessor: (item) => {
      if (item.isDismissed) return 'dismissed';
      if (item.isAcknowledged) return 'acknowledged';
      return 'new';
    },
    options: [
      { value: 'all', label: 'All Status' },
      { value: 'new', label: 'New' },
      { value: 'acknowledged', label: 'Acknowledged' },
      { value: 'dismissed', label: 'Snoozed' }
    ]
  };

  // Get unique categories from product alerts
  const uniqueCategories = [...new Set(alertData.allAlerts?.map(item => item.productCategory) || [])].filter(Boolean);
  const categoryFilter = {
    key: 'productCategory',
    label: 'Category',
    accessor: (item) => item.productCategory,
    options: [
      { value: 'all', label: 'All Categories' },
      ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
    ]
  };

  const handleAlertAction = (alert, action) => {
    if (action === 'resolved') {
      // Calculate warehouse-level data for this product
      const productStock = stock.filter(s => s.productId === alert.productId);
      const stockByWarehouse = productStock.map(stockItem => {
        const warehouse = warehouses.find(w => w.id === stockItem.warehouseId);
        return {
          warehouseId: stockItem.warehouseId,
          warehouseName: warehouse?.name || 'Unknown Warehouse',
          quantity: stockItem.quantity
        };
      });

      // Enhanced alert object with warehouse breakdown
      const enhancedAlert = {
        ...alert,
        stockByWarehouse
      };

      setSelectedAlertForStock(enhancedAlert);
      setStockModalOpen(true);
      return;
    }
    
    setSelectedAlert(alert);
    setActionType(action);
    setActionNotes('');
    setActionDialogOpen(true);
  };

  const submitAlertAction = async () => {
    if (!selectedAlert || !actionType) return;

    setSubmittingAction(true);
    try {
      const payload = {
        productId: selectedAlert.productId,
        alertType: selectedAlert.alertType,
        action: actionType,
        notes: actionNotes
      };

      if (actionType === 'dismissed') {
        const dismissedUntil = new Date();
        dismissedUntil.setDate(dismissedUntil.getDate() + 7); // Dismiss for 7 days
        payload.dismissedUntil = dismissedUntil.toISOString();
      }

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${actionType} alert`);
      }

      showSuccess(`Alert ${actionType} successfully`);
      setActionDialogOpen(false);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error submitting alert action:', err);
      showError(err.message || `Failed to ${actionType} alert`);
    } finally {
      setSubmittingAction(false);
    }
  };

  const getActionButtons = (alert) => {
    const actions = [];

    if (!alert.isAcknowledged && !alert.isDismissed) {
      actions.push({
        label: 'Acknowledge',
        icon: CheckCircleIcon,
        color: 'success',
        onClick: () => handleAlertAction(alert, 'acknowledged')
      });
    }

    if (!alert.isDismissed) {
      actions.push({
        label: 'Snooze',
        icon: CancelIcon,
        color: 'default',
        onClick: () => handleAlertAction(alert, 'dismissed')
      });
    }

    // Check if any warehouse needs action
    const productStock = stock.filter(s => s.productId === alert.productId);
    const product = products.find(p => p.id === alert.productId);
    const needsAction = productStock.some(s => 
      s.quantity === 0 || s.quantity < (product?.reorderPoint || 0)
    );

    if (needsAction) {
      actions.push({
        label: 'Restock',
        icon: InventoryIcon,
        color: 'warning',
        onClick: () => handleAlertAction(alert, 'resolved')
      });
    }

    return actions;
  };

  if (loading) {
    return <LoadingState message="Loading alerts..." />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={fetchData}
        title="Error Loading Alerts"
      />
    );
  }

  return (
    <>
      <Head>
        <title>Stock Alerts - GreenSupply Co</title>
        <meta name="description" content="Inventory stock alerts and management for GreenSupply Co" />
      </Head>
      
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Stock Alerts
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Alert Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="error.main">
                {dashboardMetrics.criticalStockCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Warehouses
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {dashboardMetrics.lowStockCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Warehouses
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {alertData.alertSummary.overstocked}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overstocked Items
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {alertData.alertSummary.adequate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Healthy Stock
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {alertData.hasActiveAlerts && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You have {alertData.alertSummary.totalAlerts} active stock alerts requiring attention.
          </Alert>
        )}

        <AppTable
          data={alertData.allAlerts || []}
          columns={alertColumns}
          title="All Stock Alerts"
          searchable={true}
          filterable={true}
          sortable={true}
          paginated={true}
          filters={[severityFilter, statusFilter, categoryFilter]}
          actions={[
            {
              id: 'actions',
              label: 'Actions',
              render: (alert) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {getActionButtons(alert).map((action, index) => (
                    <Tooltip key={index} title={action.label}>
                      <IconButton
                        size="small"
                        color={action.color}
                        onClick={action.onClick}
                      >
                        <action.icon />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              )
            }
          ]}
          emptyMessage="No alerts found."
        />

        {/* Action Dialog */}
        <Dialog 
          open={actionDialogOpen} 
          onClose={() => !submittingAction && setActionDialogOpen(false)}
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
              onClick={() => setActionDialogOpen(false)}
              disabled={submittingAction}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAlertAction}
              variant="contained"
              disabled={submittingAction}
            >
              {submittingAction ? 'Processing...' : actionType === 'dismissed' ? 'Snooze Alert' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Alert`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stock Breakdown Modal */}
        <Dialog 
          open={stockModalOpen} 
          onClose={() => setStockModalOpen(false)}
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
            <Button onClick={() => setStockModalOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}