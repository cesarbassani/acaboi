// src/components/dashboard/InfoCard.tsx
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  trend 
}) => {
  const theme = useTheme();
  
  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography 
                variant="body2" 
                color={trend.isPositive ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              backgroundColor: color || theme.palette.primary.main,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoCard;