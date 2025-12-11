import { Box, Card, CardContent, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  subtitleIcon: SubtitleIcon, 
  subtitleColor = 'text.secondary',
  valueColor = 'text.primary',
  chip,
  iconColor = 'primary.main',
  onClick,
  clickable = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        minWidth: 0, // Prevents overflow
        '&:hover': clickable ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(46, 125, 50, 0.2)',
        } : {}
      }}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon sx={{ mr: 1, color: iconColor, fontSize: '2rem' }} />
            <Typography variant="h6" color="text.secondary">{title}</Typography>
          </Box>
        </Box>
        
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 1, color: valueColor }}>
          {value}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {subtitle && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {SubtitleIcon && (
                <SubtitleIcon sx={{ color: subtitleColor, fontSize: '1rem', mr: 0.5 }} />
              )}
              <Typography variant="body2" color={subtitleColor}>
                {subtitle}
              </Typography>
            </Box>
          )}
          {chip && chip}
        </Box>
      </CardContent>
    </Card>
  );
}