import { Grid, Paper, Typography } from '@mui/material';

export default function AlertSummary({ dashboardMetrics, alertData }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="error.main">
            {dashboardMetrics.criticalStockCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Critical Warehouses
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="warning.main">
            {dashboardMetrics.lowStockCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Low Stock Warehouses
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="info.main">
            {alertData.alertSummary.overstocked}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overstocked Items
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main">
            {alertData.alertSummary.adequate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Healthy Stock
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}