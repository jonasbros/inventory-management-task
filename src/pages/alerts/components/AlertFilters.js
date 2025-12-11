export const getAlertFilters = (alertData) => {
  const severityFilter = {
    key: 'severity',
    label: 'Severity',
    accessor: (item) => {
      // This should match the severity logic from AlertColumns
      return item.severity;
    },
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

  return [severityFilter, statusFilter, categoryFilter];
};