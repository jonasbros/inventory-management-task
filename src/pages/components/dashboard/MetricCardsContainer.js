import { Grid, Chip, Tooltip } from '@mui/material';
import MetricCard from '../MetricCard';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useDashboardMetrics } from '../../../hooks/useDashboardMetrics';

export default function MetricCardsContainer({ 
  products, 
  warehouses, 
  stock, 
  totalValue, 
  inventoryOverview 
}) {
  const metrics = useDashboardMetrics(products, warehouses, stock, inventoryOverview);

  return (
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
          title="Low Stock Alerts"
          value={`${metrics.lowStockCount} products`}
          icon={WarningIcon}
          iconColor="warning.main"
          valueColor={metrics.lowStockCount > 0 ? 'warning.main' : 'text.primary'}
          subtitle={metrics.warehouseLowStockCount > 0 ? `${metrics.warehouseLowStockCount} warehouses affected` : "All warehouses healthy"}
          subtitleColor={metrics.warehouseLowStockCount > 0 ? "warning.main" : "success.main"}
          chip={
            <Tooltip title="Products with stock below 50% of reorder point at specific warehouses - immediate attention required">
              <Chip 
                label={`${metrics.criticalStockCount} critical`} 
                size="small" 
                color={metrics.criticalStockCount > 0 ? "error" : "default"}
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
        />
      </Grid>
    </Grid>
  );
}