// src/components/dashboard/PieChartCard.tsx
import React from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: {
    name: string;
    value: number;
  }[];
  colors?: string[];
  height?: number;
}

const COLORS = ['#A6CE39', '#81C784', '#64B5F6', '#FFB74D', '#BA68C8', '#4DB6AC'];

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  subtitle,
  data,
  colors = COLORS,
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toLocaleString('pt-BR')} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChartCard;