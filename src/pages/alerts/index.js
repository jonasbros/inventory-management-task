import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import AppTable from '../components/AppTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useAlertData } from '../../hooks/useAlertData';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useNotification } from '../../contexts/NotificationContext';
import { getAlertColumns } from './components/AlertColumns';
import { getAlertFilters } from './components/AlertFilters';
import { AlertActionsRenderer } from './components/AlertActions';
import AlertSummary from './components/AlertSummary';
import AcknowledgeDialog from './components/AcknowledgeDialog';
import StockBreakdownModal from './components/StockBreakdownModal';



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

  // Get columns and filters from separate components
  const alertColumns = getAlertColumns(stock, products);
  const alertFilters = getAlertFilters(alertData);

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

        <AlertSummary dashboardMetrics={dashboardMetrics} alertData={alertData} />

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
          filters={alertFilters}
          actions={[
            {
              id: 'actions',
              label: 'Actions',
              render: (alert) => (
                <AlertActionsRenderer 
                  alert={alert}
                  stock={stock}
                  products={products}
                  handleAlertAction={handleAlertAction}
                />
              )
            }
          ]}
          emptyMessage="No alerts found."
        />

        <AcknowledgeDialog
          open={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
          selectedAlert={selectedAlert}
          actionType={actionType}
          actionNotes={actionNotes}
          setActionNotes={setActionNotes}
          submittingAction={submittingAction}
          onSubmit={submitAlertAction}
          stock={stock}
          warehouses={warehouses}
          products={products}
        />

        <StockBreakdownModal
          open={stockModalOpen}
          onClose={() => setStockModalOpen(false)}
          selectedAlertForStock={selectedAlertForStock}
          stock={stock}
        />
      </Container>
    </>
  );
}