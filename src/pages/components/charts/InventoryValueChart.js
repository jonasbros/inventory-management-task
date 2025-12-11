import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';

export default function InventoryValueChart({ valueByCategory = [], totalValue = 0 }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Create chart data with lighter theme colors for better text contrast
  const chartColors = [
    theme.palette.success.light,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.info.light,
    theme.palette.warning.light,
    theme.palette.error.light,
  ];

  const data = valueByCategory.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
      
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
            Value: ${data.value.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {percentage}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Products: {data.payload.productCount}
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
        gap: isMobile ? 1 : 1.5, 
        justifyContent: 'center' 
      }}>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: entry.color, 
                borderRadius: '50%' 
              }} 
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (data.length === 0 || totalValue === 0) {
    return (
      <Paper elevation={2} sx={{ 
        p: isMobile ? 2 : 3, 
        height: isMobile ? 300 : 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography variant="body2" color="text.secondary">
          No inventory value data available
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
        Inventory Value by Category
      </Typography>
      
      <Box sx={{ position: 'relative', flexGrow: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
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
            variant={isMobile ? "h6" : "h5"} 
            fontWeight={700} 
            color="text.primary"
          >
            ${totalValue.toLocaleString()}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ lineHeight: 1, fontSize: isMobile ? '0.65rem' : '0.75rem' }}
          >
            Total Value
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <CustomLegend payload={data.map(item => ({ value: item.name, color: item.color, payload: item }))} />
      </Box>
    </Paper>
  );
}