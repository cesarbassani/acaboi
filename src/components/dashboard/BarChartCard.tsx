// src/components/dashboard/BarChartCard.tsx
import React from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  height?: number;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  subtitle,
  data,
  dataKey,
  categoryKey,
  color = '#A6CE39',
  height = 300,
}) => {
  return (
    <Card elevation={2}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        }
        subheader={subtitle}
      />
      <Divider />
      <CardContent>
        <Box sx={{ height: height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={categoryKey} 
                angle={-45} 
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip formatter={(value) => Number(value).toLocaleString('pt-BR')} />
              <Bar dataKey={dataKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartCard;