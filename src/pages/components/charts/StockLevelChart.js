import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';

export default function StockLevelChart({ metrics, stock = [], products = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      color: theme.palette.success.main
    },
    { 
      name: 'Low Stock', 
      value: lowStockCount, 
      color: theme.palette.warning.main
    },
    { 
      name: 'Critical Stock', 
      value: criticalCount, 
      color: theme.palette.error.main
    },
    { 
      name: 'Out of Stock', 
      value: outOfStockCount, 
      color: theme.palette.error.dark
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
      <Box sx={{ 
        mt: isMobile ? 1 : 2, 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: isMobile ? 1 : 2, 
        justifyContent: 'center' 
      }}>
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
      <Paper elevation={2} sx={{ 
        p: isMobile ? 2 : 3, 
        height: isMobile ? 300 : 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
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
        p: isMobile ? 2 : 3, 
        height: isMobile ? 300 : 400, 
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
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        gutterBottom 
        sx={{ 
          mb: isMobile ? 1 : 2,
          fontWeight: 600
        }}
      >
        Stock Level Distribution
      </Typography>
      
      <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 50}
              outerRadius={isMobile ? 65 : 80}
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
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight={700} 
            color="primary.main"
          >
            {totalProducts}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ lineHeight: 1, fontSize: isMobile ? '0.65rem' : '0.75rem' }}
          >
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