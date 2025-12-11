import { Chip, Button, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Link from 'next/link';

// Helper function to get status chip for inventory items
export const getInventoryStatusChip = (item, product) => {
  if (item.isOutOfStock || item.totalQuantity === 0) {
    return <Chip label="Out of Stock" color="error" size="small" />;
  }
  if (item.isCriticalStock) {
    return <Chip label="Critical" color="error" size="small" />;
  }
  if (item.isLowStock) {
    return <Chip label="Low Stock" color="warning" size="small" />;
  }
  return <Chip label="In Stock" color="success" size="small" />;
};

// Helper function for restock button
export const getRestockButton = (item, onRestock) => {
  const shouldShow = item.isLowStock || item.isCriticalStock || item.isOutOfStock;
  if (!shouldShow || !onRestock) return null;

  return (
    <Button
      size="small"
      variant="contained"
      color={item.isOutOfStock ? "error" : "warning"}
      onClick={() => onRestock(item)}
      sx={{ minWidth: 'auto' }}
    >
      Restock
    </Button>
  );
};

// Products table columns
export const getProductsColumns = (onEdit, onDelete) => [
  {
    key: 'sku',
    label: 'SKU',
    sortable: true,
    accessor: (item) => item.sku,
  },
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    accessor: (item) => item.name,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    accessor: (item) => item.category,
  },
  {
    key: 'unitCost',
    label: 'Unit Cost',
    align: 'right',
    sortable: true,
    accessor: (item) => item.unitCost,
    render: (value) => `$${value?.toFixed(2)}`,
  },
  {
    key: 'reorderPoint',
    label: 'Reorder Point',
    align: 'right',
    sortable: true,
    accessor: (item) => item.reorderPoint,
  },
];

// Stock table columns
export const getStockColumns = (products = [], warehouses = [], onEdit, onDelete) => [
  {
    key: 'sku',
    label: 'SKU',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? product.sku : 'Unknown';
    },
  },
  {
    key: 'product',
    label: 'Product Name',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? product.name : 'Unknown';
    },
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? product.category : 'Unknown';
    },
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    sortable: true,
    accessor: (item) => {
      const warehouse = warehouses.find(w => w.id === item.warehouseId);
      return warehouse ? warehouse.name : 'Unknown';
    },
  },
  {
    key: 'quantity',
    label: 'Stock',
    align: 'right',
    sortable: true,
    accessor: (item) => item.quantity?.toLocaleString(),
  },
  {
    key: 'reorderPoint',
    label: 'Reorder Point',
    align: 'right',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? product.reorderPoint?.toLocaleString() : 'Unknown';
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return 'Unknown';
      
      if (item.quantity === 0) return 'Out of Stock';
      if (item.quantity < product.reorderPoint * 0.5) return 'Critical';
      if (item.quantity < product.reorderPoint) return 'Low Stock';
      return 'In Stock';
    },
    render: (value, item) => {
      const product = products.find(p => p.id === item.productId);
      return getInventoryStatusChip({ 
        isOutOfStock: item.quantity === 0,
        isCriticalStock: product && item.quantity < product.reorderPoint * 0.5,
        isLowStock: product && item.quantity < product.reorderPoint,
        totalQuantity: item.quantity 
      }, product);
    },
  },
];

// Warehouses table columns
export const getWarehousesColumns = (onEdit, onDelete) => [
  {
    key: 'code',
    label: 'Code',
    sortable: true,
    accessor: (item) => item.code,
  },
  {
    key: 'name',
    label: 'Warehouse Name',
    sortable: true,
    accessor: (item) => item.name,
  },
  {
    key: 'location',
    label: 'Location',
    sortable: true,
    accessor: (item) => item.location,
  },
];

// Helper function to get alert indicator
export const getAlertIndicator = (item, alertData) => {
  if (!alertData || !alertData.allAlerts) return null;
  
  const alert = alertData.allAlerts.find(a => a.productId === item.id);
  if (!alert || alert.severity === 'adequate' || alert.isDismissed) return null;

  const getIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <ErrorIcon fontSize="small" />;
      case 'low':
        return <WarningIcon fontSize="small" />;
      case 'overstocked':
        return <NotificationsActiveIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'error.main';
      case 'low':
        return 'warning.main';
      case 'overstocked':
        return 'info.main';
      default:
        return 'default';
    }
  };

  return (
    <Tooltip title={alert.recommendedAction}>
      <Box sx={{ color: getColor(), display: 'flex', alignItems: 'center' }}>
        {getIcon()}
      </Box>
    </Tooltip>
  );
};

// Inventory overview columns (for dashboard)
export const getInventoryColumns = (products = [], warehouses = [], alertData = null) => [
  {
    key: 'alert',
    label: 'Alert',
    sortable: false,
    accessor: () => '',
    render: (value, item) => getAlertIndicator(item, alertData),
  },
  {
    key: 'sku',
    label: 'SKU',
    sortable: true,
    accessor: (item) => item.sku,
  },
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    accessor: (item) => item.name,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    accessor: (item) => item.category,
  },
  {
    key: 'totalQuantity',
    label: 'Total Stock',
    align: 'right',
    sortable: true,
    accessor: (item) => item.totalQuantity?.toLocaleString(),
  },
  {
    key: 'reorderPoint',
    label: 'Reorder Point',
    align: 'right',
    sortable: true,
    accessor: (item) => item.reorderPoint?.toLocaleString(),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    accessor: (item) => {
      if (item.isOutOfStock) return 'Out of Stock';
      if (item.isCriticalStock) return 'Critical';
      if (item.isLowStock) return 'Low Stock';
      return 'In Stock';
    },
    render: (value, item) => {
      const product = products.find(p => p.id === item.id);
      return getInventoryStatusChip(item, product);
    },
  },
];

// Common action generators
export const getEditAction = (href, label = "Edit") => (item) => (
  <Button
    key="edit"
    size="small"
    variant="outlined"
    color="primary"
    startIcon={<EditIcon />}
    component={Link}
    href={typeof href === 'function' ? href(item) : href.replace(':id', item.id)}
    sx={{ minWidth: 'auto' }}
  >
    {label}
  </Button>
);

export const getDeleteAction = (onDelete, label = "Delete") => (item) => (
  <Button
    key="delete"
    size="small"
    variant="contained"
    color="error"
    startIcon={<DeleteIcon />}
    onClick={() => onDelete(item.id)}
    sx={{ minWidth: 'auto' }}
  >
    {label}
  </Button>
);

export const getRestockAction = (onRestock) => (item) => getRestockButton(item, onRestock);

export const getTransferAction = (onTransfer) => (item) => {
  if (item.quantity === 0) return null;
  
  return (
    <Button
      key="transfer"
      size="small"
      variant="contained"
      color="secondary"
      startIcon={<SwapHorizIcon />}
      onClick={() => onTransfer(item)}
      sx={{ minWidth: 'auto' }}
    >
      Transfer
    </Button>
  );
};

export const getRequestStockAction = (onRequestStock) => (item) => {
  if (item.quantity > 0) return null;
  
  return (
    <Button
      key="request"
      size="small"
      variant="outlined"
      color="warning"
      startIcon={<SwapHorizIcon />}
      onClick={() => onRequestStock(item)}
      sx={{ minWidth: 'auto' }}
    >
      Request Stock
    </Button>
  );
};

// Filter configurations
export const getCategoryFilter = (data, accessor = (item) => item.category) => ({
  key: 'category',
  label: 'Category',
  accessor,
});

export const getStatusFilter = () => ({
  key: 'status',
  label: 'Status',
  accessor: (item) => {
    if (item.isOutOfStock || item.totalQuantity === 0) return 'Out of Stock';
    if (item.isCriticalStock) return 'Critical';
    if (item.isLowStock) return 'Low Stock';
    return 'In Stock';
  },
});

export const getWarehouseFilter = (warehouses = []) => ({
  key: 'warehouse',
  label: 'Warehouse',
  accessor: (item) => {
    const warehouse = warehouses.find(w => w.id === item.warehouseId);
    return warehouse ? warehouse.name : 'Unknown';
  },
});

export const getProductFilter = (products = []) => ({
  key: 'product',
  label: 'Product',
  accessor: (item) => {
    const product = products.find(p => p.id === item.productId);
    return product ? product.name : 'Unknown';
  },
});

// Transfer table columns
export const getTransferColumns = (products = [], warehouses = []) => [
  {
    key: 'id',
    label: 'Transfer ID',
    sortable: true,
    accessor: (item) => item.id,
  },
  {
    key: 'product',
    label: 'Product',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? `${product.name} (${product.sku})` : 'Unknown';
    },
  },
  {
    key: 'fromWarehouse',
    label: 'From Warehouse',
    sortable: true,
    accessor: (item) => {
      const warehouse = warehouses.find(w => w.id === item.fromWarehouseId);
      return warehouse ? warehouse.name : 'Unknown';
    },
  },
  {
    key: 'toWarehouse',
    label: 'To Warehouse',
    sortable: true,
    accessor: (item) => {
      const warehouse = warehouses.find(w => w.id === item.toWarehouseId);
      return warehouse ? warehouse.name : 'Unknown';
    },
  },
  {
    key: 'quantity',
    label: 'Quantity',
    align: 'right',
    sortable: true,
    accessor: (item) => item.quantity,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    accessor: (item) => item.status,
    render: (value) => (
      <Chip 
        label={value} 
        color={value === 'completed' ? 'success' : 'warning'} 
        size="small" 
      />
    ),
  },
  {
    key: 'createdAt',
    label: 'Transfer Date',
    sortable: true,
    accessor: (item) => item.createdAt,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'notes',
    label: 'Notes',
    accessor: (item) => item.notes || '-',
  },
];