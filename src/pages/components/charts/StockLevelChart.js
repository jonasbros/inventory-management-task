import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

export default function StockLevelChart({ metrics, stock = [], products = [] }) {
  // Use warehouse-level incidents to match the cards
  const outOfStockCount = metrics.outOfStockCount || 0;
  const criticalCount = metrics.criticalStockCount || 0; 
  const lowStockCount = metrics.lowStockCount || 0;
  
  // Calculate healthy count as total products minus those with any warehouse issues
  const productsWithIssues = new Set([
    ...metrics.lowStockIncidents?.map(item => item.productId) || [],
    ...metrics.criticalStockIncidents?.map(item => item.productId) || [],
    ...(stock?.filter(item => item.quantity === 0).map(item => item.productId) || [])
  ]);
  
  const healthyCount = products.length - productsWithIssues.size;

  const data = [
    { 
      name: 'Healthy Stock', 
      value: healthyCount, 
      color: '#2e7d32' // success.main
    },
    { 
      name: 'Low Stock', 
      value: lowStockCount, 
      color: '#ed6c02' // warning.main
    },
    { 
      name: 'Critical Stock', 
      value: criticalCount, 
      color: '#d32f2f' // error.main
    },
    { 
      name: 'Out of Stock', 
      value: outOfStockCount, 
      color: '#9c27b0' // purple for out of stock
    }
  ].filter(item => item.value > 0); // Only show categories with actual data

  const totalProducts = products.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalProducts > 0 ? ((data.value / totalProducts) * 100).toFixed(1) : 0;
      
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
            {data.payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Products: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: entry.color, 
                borderRadius: '50%' 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {entry.value}: {entry.payload.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (totalProducts === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No inventory data available
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
        '& .recharts-sector': {
          outline: 'none !important'
        },
        '& .recharts-tooltip-wrapper': {
          zIndex: '9999 !important'
        }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        Stock Level Distribution
      </Typography>
      
      <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              style={{ outline: 'none' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text overlay */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {totalProducts}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            Total Products
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <CustomLegend payload={data.map(item => ({ value: item.name, color: item.color, payload: item }))} />
      </Box>
    </Paper>
  );
}