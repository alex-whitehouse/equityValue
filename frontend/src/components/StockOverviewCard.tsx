import React from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import type { StockOverview } from '../types/stock';
import DataCard from './DataCard';
import InfoIcon from '@mui/icons-material/Info';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface StockOverviewCardProps {
  overview: StockOverview | null;
  loading: boolean;
  error: string | null;
}

const formatNumber = (value: number): string => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const StockOverviewCard: React.FC<StockOverviewCardProps> = ({
  overview,
  loading,
  error,
}) => {
  if (error) {
    return (
      <DataCard 
        title="Error" 
        headerColor="error"
        footer={
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        }
      >
        <Typography variant="body1">
          Failed to load stock overview data.
        </Typography>
      </DataCard>
    );
  }

  const renderSection = (
    title: string, 
    icon: React.ReactElement,
    items: { label: string; value: string | number | undefined }[]
  ) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ fontSize: '1rem' }}>
          {icon}
        </Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 1,
        mb: 1
      }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              {item.label}:
            </Typography>
            {loading ? (
              <Skeleton width={80} height={24} />
            ) : (
              <Typography variant="body2" fontWeight={500}>
                {item.value !== undefined ? item.value : 'N/A'}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <DataCard 
      title={overview?.name || 'Stock Overview'} 
      icon={<AssessmentIcon />}
      loading={loading}
    >
      {renderSection('Company Info', <InfoIcon />, [
        { label: 'Symbol', value: overview?.symbol || 'N/A' },
        { label: 'Sector', value: overview?.sector || 'N/A' },
        { label: 'Industry', value: overview?.industry || 'N/A' },
      ])}
      
      {renderSection('Valuation', <TrendingUpIcon />, [
        { label: 'Market Cap', value: overview?.marketCap ? formatNumber(overview.marketCap) : 'N/A' },
        { label: 'P/E Ratio', value: overview?.peRatio || 'N/A' },
        { label: 'Dividend Yield', value: overview?.dividendYield ? `${overview.dividendYield}%` : 'N/A' },
        { label: 'Target Price', value: overview?.analystTargetPrice || 'N/A' },
        { label: 'Beta', value: overview?.beta || 'N/A' },
      ])}
      
      {renderSection('Performance', <AssessmentIcon />, [
        { label: '52W High', value: overview?.high52 || 'N/A' },
        { label: '52W Low', value: overview?.low52 || 'N/A' },
        { label: 'EPS', value: overview?.eps || 'N/A' },
        { label: 'Revenue', value: overview?.revenue ? formatNumber(overview.revenue) : 'N/A' },
        { label: 'Profit Margin', value: overview?.profitMargin ? `${overview.profitMargin}%` : 'N/A' },
      ])}
    </DataCard>
  );
};

export default StockOverviewCard;