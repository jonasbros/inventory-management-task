import { useState } from 'react';
import { Grid, Chip, Tooltip } from '@mui/material';
import MetricCard from './MetricCard';
import StockDetailsModal from './StockDetailsModal';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useDashboardMetrics } from '../../../hooks/useDashboardMetrics';

export default function MetricCardsContainer({ 
  products, 
  warehouses, 
  stock, 
  totalValue, 
  inventoryOverview,
  alertData
}) {
  const metrics = useDashboardMetrics(products, warehouses, stock, inventoryOverview);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: '', data: [] });

  const handleLowStockClick = () => {
    setModalData({
      title: 'Low Stock Details',
      data: metrics.lowStockIncidents
    });
    setModalOpen(true);
  };

  const handleOutOfStockClick = () => {
    // Get out of stock incidents from stock data
    const outOfStockIncidents = stock.filter(item => item.quantity === 0);
    setModalData({
      title: 'Out of Stock Details',
      data: outOfStockIncidents
    });
    setModalOpen(true);
  };

  const handleCriticalAlertsClick = () => {
    const criticalAlerts = alertData?.alerts?.filter(alert => alert.severity === 'critical') || [];
    setModalData({
      title: 'Critical Stock Alerts',
      data: criticalAlerts
    });
    setModalOpen(true);
  };

  const handleActiveAlertsClick = () => {
    // Navigate to alerts page instead of showing modal
    window.location.href = '/alerts';
  };

  return (
    <>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Products"
          value={products.length}
          icon={CategoryIcon}
          subtitle={`${metrics.healthyStockCount} healthy stock`}
          subtitleIcon={TrendingUpIcon}
          subtitleColor="success.main"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={InventoryIcon}
          subtitle={`${warehouses.length} warehouses`}
          subtitleIcon={WarehouseIcon}
          subtitleColor="primary.main"
          iconColor="primary.main"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Stock Alerts"
          value={`${alertData?.alertSummary?.totalAlerts || 0} active`}
          icon={NotificationsActiveIcon}
          iconColor={alertData?.criticalCount > 0 ? "error.main" : alertData?.lowStockCount > 0 ? "warning.main" : "success.main"}
          valueColor={alertData?.criticalCount > 0 ? 'error.main' : alertData?.lowStockCount > 0 ? 'warning.main' : 'success.main'}
          subtitle={
            alertData?.criticalCount > 0 
              ? `${alertData.criticalCount} critical alerts` 
              : alertData?.lowStockCount > 0 
                ? `${alertData.lowStockCount} low stock alerts`
                : "All inventory healthy"
          }
          subtitleColor={
            alertData?.criticalCount > 0 ? "error.main" 
            : alertData?.lowStockCount > 0 ? "warning.main" 
            : "success.main"
          }
          clickable={true}
          onClick={handleActiveAlertsClick}
          chip={
            <Tooltip title="Critical alerts require immediate attention - products below 50% of reorder point or out of stock">
              <Chip 
                label={`${alertData?.criticalCount || 0} critical`} 
                size="small" 
                color={alertData?.criticalCount > 0 ? "error" : "default"}
                variant="outlined"
              />
            </Tooltip>
          }
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Out of Stock"
          value={`${metrics.outOfStockCount} product(s)`}
          icon={ErrorIcon}
          iconColor="error.main"
          valueColor={metrics.outOfStockCount > 0 ? 'error.main' : 'text.primary'}
          subtitle={metrics.warehouseZeroStockCount > 0 ? `${metrics.warehouseZeroStockCount} warehouse locations` : "All warehouses stocked"}
          subtitleColor={metrics.warehouseZeroStockCount > 0 ? "error.main" : "success.main"}
          clickable={true}
          onClick={handleOutOfStockClick}
        />
      </Grid>
    </Grid>
    
    <StockDetailsModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title={modalData.title}
      stockData={modalData.data}
      products={products}
      warehouses={warehouses}
    />
    </>
  );
}