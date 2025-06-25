import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Skeleton, Typography } from '@mui/material';
import { fetchStockOverview } from '../services/api';
import type { StockOverview } from '../types/stock';
import ChartComponent from './ChartComponent';
import DataCard from './DataCard';
import StockOverviewCard from './StockOverviewCard';

const StockDashboard: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      setLoading(true);
      setError(null);
      
      fetchStockOverview(symbol)
        .then(data => {
          setStock(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch stock data. Please try again later.');
          setLoading(false);
        });
    }
  }, [symbol]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="grid-container" gap={2}>
          <StockOverviewCard
            overview={null}
            loading={true}
            error={null}
          />
          <DataCard title="Analyst Ratings" loading={true}>
            <Box mt={1}>
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Box>
          </DataCard>
          <DataCard title="Price Chart" loading={true}>
            <Skeleton variant="rectangular" height={200} />
          </DataCard>
        </Box>
      );
    }
    
    if (error) {
      return (
        <StockOverviewCard
          overview={null}
          loading={false}
          error={error}
        />
      );
    }
    
    if (!stock) {
      return (
        <StockOverviewCard
          overview={null}
          loading={false}
          error="No stock data available for this symbol. Please try another search."
        />
      );
    }
    
    return (
      <Box className="grid-container">
        <StockOverviewCard
          overview={stock}
          loading={false}
          error={null}
        />
        
        <DataCard title="Analyst Ratings">
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={1.5}>
            <div>
              <Typography variant="subtitle2" color="text.secondary">Strong Buy</Typography>
              <Typography>{stock.analystRating?.strongBuy || 0}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="text.secondary">Buy</Typography>
              <Typography>{stock.analystRating?.buy || 0}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="text.secondary">Hold</Typography>
              <Typography>{stock.analystRating?.hold || 0}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="text.secondary">Sell</Typography>
              <Typography>{stock.analystRating?.sell || 0}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="text.secondary">Strong Sell</Typography>
              <Typography>{stock.analystRating?.strongSell || 0}</Typography>
            </div>
          </Box>
        </DataCard>
        
        <DataCard title="Price Chart">
          <ChartComponent stock={stock} />
        </DataCard>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      {renderContent()}
    </Box>
  );
};

export default StockDashboard;