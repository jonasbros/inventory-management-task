import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

export default function WarehouseCapacityChart({ warehouseData = [] }) {
  const theme = useTheme();
  
  // Debug: log the data to see what we're getting
  console.log('Warehouse Data:', warehouseData);

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
            Product Lines: {data.payload.productLines}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (warehouseData.length === 0) {
    return (
      <Paper elevation={2} sx={{ 
        p: { xs: 2, md: 3 }, 
        height: { xs: 300, md: 400 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="body2" color="text.secondary">
          No warehouse data available (received {warehouseData.length} items)
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        height: { xs: 300, md: 400 }, 
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
      <Typography 
        variant={{ xs: "subtitle1", md: "h6" }} 
        gutterBottom 
        sx={{ 
          mb: { xs: 1, md: 2 },
          fontWeight: 600
        }}
      >
        Warehouse Capacity Overview
      </Typography>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={warehouseData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.grey[400] }}
              tickLine={{ stroke: theme.palette.grey[400] }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              axisLine={{ stroke: theme.palette.grey[400] }}
              tickLine={{ stroke: theme.palette.grey[400] }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="totalUnits" 
              fill={theme.palette.primary.light}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total inventory units per warehouse location
        </Typography>
      </Box>
    </Paper>
  );
}