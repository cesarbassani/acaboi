// src/components/dashboard/LineChartCard.tsx
import React from 'react';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  lines: {
    dataKey: string;
    color: string;
    name?: string;
  }[];
  xAxisKey: string;
  height?: number;
}

const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  subtitle,
  data,
  lines,
  xAxisKey,
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
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisKey} 
                angle={-45} 
                textAnchor="end" 
                height={60}
              />
              <YAxis />
              <Tooltip formatter={(value) => Number(value).toLocaleString('pt-BR')} />
              {lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  name={line.name || line.dataKey}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineChartCard;