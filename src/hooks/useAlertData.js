import { useMemo } from 'react';

/**
 * Custom hook for calculating low stock alerts and reorder recommendations
 * Follows the pattern established in useDashboardData.js
 * 
 * @param {Array} products - Product data array
 * @param {Array} stock - Stock data array  
 * @param {Array} warehouses - Warehouse data array
 * @param {Array} alertActions - Tracked alert actions from alerts.json
 * @returns {Object} Alert data and calculations
 */
export function useAlertData(products, stock, warehouses, alertActions = []) {
  return useMemo(() => {
    if (!products.length || !stock.length || !warehouses.length) {
      return {
        alerts: [],
        alertSummary: {
          critical: 0,
          low: 0,
          adequate: 0,
          overstocked: 0,
          totalAlerts: 0
        }
      };
    }

    // Calculate alerts for each product
    const alerts = products.map(product => {
      // Calculate total stock across all warehouses for this product
      const productStock = stock.filter(s => s.productId === product.id);
      const totalQuantity = productStock.reduce((sum, s) => sum + s.quantity, 0);
      
      // Determine alert severity based on business rules
      let severity = 'adequate';
      let alertType = null;
      let recommendedAction = null;
      let reorderQuantity = 0;

      if (totalQuantity === 0) {
        severity = 'critical';
        alertType = 'out_of_stock';
        recommendedAction = `Urgent: Reorder ${product.reorderPoint * 2} units immediately`;
        reorderQuantity = product.reorderPoint * 2;
      } else if (totalQuantity < product.reorderPoint * 0.5) {
        severity = 'critical'; 
        alertType = 'critical_low';
        recommendedAction = `Critical: Reorder ${product.reorderPoint * 1.5} units`;
        reorderQuantity = Math.ceil(product.reorderPoint * 1.5);
      } else if (totalQuantity < product.reorderPoint) {
        severity = 'low';
        alertType = 'low_stock';
        recommendedAction = `Reorder ${product.reorderPoint - totalQuantity + 50} units`;
        reorderQuantity = product.reorderPoint - totalQuantity + 50;
      } else if (totalQuantity > product.reorderPoint * 3) {
        severity = 'overstocked';
        alertType = 'overstocked';
        recommendedAction = 'Consider redistributing or reducing orders';
        reorderQuantity = 0;
      }

      // Check if this alert has been acknowledged by managers
      const alertKey = `${product.id}_${alertType}`;
      const alertAction = alertActions.find(a => 
        a.productId === product.id && 
        a.alertType === alertType &&
        a.status !== 'resolved'
      );

      const isAcknowledged = alertAction?.status === 'acknowledged';
      const isDismissed = alertAction && new Date(alertAction.dismissedUntil || 0) > new Date();

      return {
        id: alertKey,
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        currentStock: totalQuantity,
        reorderPoint: product.reorderPoint,
        severity,
        alertType,
        recommendedAction,
        reorderQuantity,
        isAcknowledged,
        isDismissed,
        stockByWarehouse: productStock.map(s => {
          const warehouse = warehouses.find(w => w.id === s.warehouseId);
          return {
            warehouseId: s.warehouseId,
            warehouseName: warehouse?.name || 'Unknown',
            quantity: s.quantity
          };
        }),
        lastUpdated: new Date().toISOString()
      };
    });

    // Filter to only include items that need attention (not adequate)
    const activeAlerts = alerts.filter(alert => 
      alert.severity !== 'adequate' && 
      !alert.isDismissed
    );

    // Calculate alert summary statistics
    const alertSummary = alerts.reduce((summary, alert) => {
      if (alert.isDismissed) {
        summary.adequate++;
        return summary;
      }

      switch (alert.severity) {
        case 'critical':
          summary.critical++;
          break;
        case 'low':
          summary.low++;
          break;
        case 'overstocked':
          summary.overstocked++;
          break;
        default:
          summary.adequate++;
      }
      return summary;
    }, {
      critical: 0,
      low: 0,
      adequate: 0,
      overstocked: 0,
      totalAlerts: 0
    });

    alertSummary.totalAlerts = alertSummary.critical + alertSummary.low + alertSummary.overstocked;

    // Sort alerts by priority (critical first, then by stock level)
    const sortedAlerts = activeAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      if (a.severity === 'low' && b.severity === 'overstocked') return -1;
      if (b.severity === 'low' && a.severity === 'overstocked') return 1;
      return a.currentStock - b.currentStock; // Lower stock first
    });

    return {
      alerts: sortedAlerts,
      allAlerts: alerts, // Include adequate items for full view
      alertSummary,
      hasActiveAlerts: alertSummary.totalAlerts > 0,
      criticalCount: alertSummary.critical,
      lowStockCount: alertSummary.low
    };
  }, [products, stock, warehouses, alertActions]);
}