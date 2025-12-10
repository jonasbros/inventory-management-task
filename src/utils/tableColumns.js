import { Chip, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
    key: 'product',
    label: 'Product',
    sortable: true,
    accessor: (item) => {
      const product = products.find(p => p.id === item.productId);
      return product ? `${product.name} (${product.sku})` : 'Unknown';
    },
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    sortable: true,
    accessor: (item) => {
      const warehouse = warehouses.find(w => w.id === item.warehouseId);
      return warehouse ? `${warehouse.name} (${warehouse.code})` : 'Unknown';
    },
  },
  {
    key: 'quantity',
    label: 'Quantity',
    align: 'right',
    sortable: true,
    accessor: (item) => item.quantity,
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

// Inventory overview columns (for dashboard)
export const getInventoryColumns = (products = [], warehouses = [], onEdit, onRestock) => [
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
    accessor: (item) => item.totalQuantity,
  },
  {
    key: 'reorderPoint',
    label: 'Reorder Point',
    align: 'right',
    sortable: true,
    accessor: (item) => item.reorderPoint,
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