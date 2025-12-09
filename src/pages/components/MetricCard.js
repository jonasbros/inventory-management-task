import { Box, Card, CardContent, Typography, Chip } from '@mui/material';

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  subtitleIcon: SubtitleIcon, 
  subtitleColor = 'text.secondary',
  valueColor = 'text.primary',
  chip,
  iconColor = 'primary.main'
}) {
  return (
    <Card sx={{ height: '100%' }}>
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