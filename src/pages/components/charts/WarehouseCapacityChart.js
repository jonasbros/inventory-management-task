import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

export default function WarehouseCapacityChart({ warehouseData = [] }) {
  const theme = useTheme();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      
      return (
        <Box 
          sx={{ 
            backgroundColor: 'white', 
            p: 2, 
            border: '1px solid #ccc', 
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 9999,
            position: 'relative'
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Stock: {data.value.toLocaleString()} units
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Products: {data.payload.productCount}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (warehouseData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No warehouse data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        height: 400, 
        display: 'flex', 
        flexDirection: 'column',
        '& .recharts-wrapper': {
          outline: 'none !important'
        },
        '& .recharts-surface': {
          outline: 'none !important'
        },
        '& .recharts-tooltip-wrapper': {
          zIndex: '9999 !important'
        }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        Warehouse Capacity Overview
      </Typography>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={warehouseData}
            layout="horizontal"
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.grey[400] }}
              tickLine={{ stroke: theme.palette.grey[400] }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={50}
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.grey[400] }}
              tickLine={{ stroke: theme.palette.grey[400] }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="totalStock" 
              fill={theme.palette.primary.light}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total stock units across all products
        </Typography>
      </Box>
    </Paper>
  );
}