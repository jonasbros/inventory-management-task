import { Chip } from '@mui/material';

export const getAlertColumns = (stock, products) => [
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