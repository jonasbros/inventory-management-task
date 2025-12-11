import { Box, IconButton, Tooltip } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

export const getActionButtons = (alert, stock, products, handleAlertAction) => {
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

export const AlertActionsRenderer = ({ alert, stock, products, handleAlertAction }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {getActionButtons(alert, stock, products, handleAlertAction).map((action, index) => (
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
);