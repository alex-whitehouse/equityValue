import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Paper,
  Box,
  Skeleton,
  Alert,
  useTheme
} from '@mui/material';
import type { StockOverview } from '../types/stock';
import EmptyState from './EmptyState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  stock?: StockOverview;
  loading?: boolean;
  error?: string | null;
}

const ChartComponent: React.FC<ChartProps> = ({
  stock,
  loading = false,
  error = null
}) => {
  const theme = useTheme();

  // Chart data configuration
  const data = {
    labels: ['52-Week High', '52-Week Low'],
    datasets: [
      {
        label: 'Price ($)',
        data: stock ? [stock.high52, stock.low52] : [0, 0],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: '52-Week High/Low',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          weight: 500
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value: any) => `$${value}`
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart' as const
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Skeleton variant="text" width="40%" height={30} />
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
      </Paper>
    );
  }

  // Render error state
  if (error) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Paper>
    );
  }

  // Render empty state
  if (!stock) {
    return (
      <EmptyState
        title="No Chart Data"
        description="Select a stock to view price history"
      />
    );
  }

  // Render chart
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ height: 300, position: 'relative' }}>
        <Bar data={data} options={options} />
      </Box>
    </Paper>
  );
};

export default ChartComponent;