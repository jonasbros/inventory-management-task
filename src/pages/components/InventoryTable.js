import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

export default function InventoryTable({ 
  data, 
  products, 
  warehouses, 
  showActions = true,
  showWarehouse = false,
  size = "medium",
  stickyHeader = false,
  onEdit,
  onRestock
}) {
  const router = useRouter();

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    } else {
      // Default behavior for main dashboard (edit product)
      router.push(`/products/edit/${item.id || item.productId}`);
    }
  };

  const handleRestock = (item) => {
    if (onRestock) {
      onRestock(item);
    } else {
      // Default behavior for main dashboard
      if (item.lowestStockWarehouse) {
        const stockRecord = item.lowestStockWarehouse;
        router.push(`/stock/edit/${stockRecord.id}?restock=true&currentQuantity=${stockRecord.quantity}`);
      }
    }
  };

  const getRowBackgroundColor = (item) => {
    if (item.isOutOfStock || item.quantity === 0) return '#ffebee';
    if (item.isCriticalStock) return '#fff3e0';
    if (item.isLowStock) return '#fff8e1';
    return 'inherit';
  };

  const getStockColor = (item) => {
    if (item.isOutOfStock || item.quantity === 0) return 'error.main';
    if (item.isCriticalStock) return 'warning.main';
    if (item.isLowStock) return 'warning.main';
    return 'text.primary';
  };

  const getStatusChip = (item, product) => {
    const isOutOfStock = item.quantity === 0 || item.isOutOfStock;
    const isCritical = item.quantity < (product?.reorderPoint * 0.5) || item.isCriticalStock;
    const isLowStock = item.quantity < product?.reorderPoint || item.isLowStock;

    if (isOutOfStock) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (isCritical) {
      return <Chip label="Critical" color="error" size="small" variant="outlined" />;
    } else if (isLowStock) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" variant="outlined" />;
    }
  };

  const shouldShowRestockButton = (item, product) => {
    const isOutOfStock = item.quantity === 0 || item.isOutOfStock;
    const isCritical = item.quantity < (product?.reorderPoint * 0.5) || item.isCriticalStock;
    const isLowStock = item.quantity < product?.reorderPoint || item.isLowStock;
    return isOutOfStock || isCritical || isLowStock;
  };

  return (
    <Table size={size} stickyHeader={stickyHeader}>
      <TableHead>
        <TableRow>
          <TableCell><strong>SKU</strong></TableCell>
          <TableCell><strong>Product Name</strong></TableCell>
          <TableCell><strong>Category</strong></TableCell>
          {showWarehouse && <TableCell><strong>Warehouse</strong></TableCell>}
          <TableCell align="right"><strong>{showWarehouse ? 'Stock' : 'Total Stock'}</strong></TableCell>
          <TableCell align="right"><strong>Reorder Point</strong></TableCell>
          <TableCell><strong>Status</strong></TableCell>
          {showActions && <TableCell><strong>Actions</strong></TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item) => {
          const product = products.find(p => p.id === (item.productId || item.id));
          const warehouse = warehouses?.find(w => w.id === item.warehouseId);
          
          return (
            <TableRow 
              key={showWarehouse ? `${item.productId}-${item.warehouseId}` : item.id}
              sx={{ backgroundColor: getRowBackgroundColor(item) }}
            >
              <TableCell>{product?.sku}</TableCell>
              <TableCell>{product?.name}</TableCell>
              <TableCell>{product?.category}</TableCell>
              {showWarehouse && (
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
              )}
              <TableCell align="right">
                <Typography 
                  variant="body2" 
                  fontWeight={item.isLowStock || item.quantity === 0 ? 600 : 400}
                  color={getStockColor(item)}
                >
                  {(item.quantity || item.totalQuantity || 0).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {product?.reorderPoint?.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                {getStatusChip(item, product)}
              </TableCell>
              {showActions && (
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={size === "small" ? <EditIcon /> : undefined}
                      onClick={() => handleEdit(item)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Edit
                    </Button>
                    {shouldShowRestockButton(item, product) && (
                      <Button
                        size="small"
                        variant="contained"
                        color={(item.quantity === 0 || item.isOutOfStock) ? "error" : "warning"}
                        onClick={() => handleRestock(item)}
                        disabled={showWarehouse ? false : !item.lowestStockWarehouse}
                        sx={{ minWidth: 'auto' }}
                      >
                        Restock
                      </Button>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}