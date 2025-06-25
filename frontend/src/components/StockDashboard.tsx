import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Skeleton, CircularProgress } from '@mui/material';
import { fetchStockOverview } from '../services/api';
import type { StockOverview } from '../types/stock';
import ChartComponent from './ChartComponent';
import DataCard from './DataCard';

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
          <DataCard title="Stock Overview" loading={true}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" />
            <Box mt={2}>
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Box>
          </DataCard>
          
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
        <DataCard title="Error">
          <Typography color="error">{error}</Typography>
          <Typography mt={1}>Please try searching for another stock.</Typography>
        </DataCard>
      );
    }
    
    if (!stock) {
      return (
        <DataCard title="No Data">
          <Typography>No stock data available for this symbol.</Typography>
          <Typography mt={1}>Please try searching for another stock.</Typography>
        </DataCard>
      );
    }
    
    return (
      <>
        <Typography variant="h4" gutterBottom>{stock.name} ({stock.symbol})</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {stock.sector} - {stock.industry}
        </Typography>
        <Typography variant="body1" paragraph>{stock.description}</Typography>
        
        <Box className="grid-container">
          <DataCard title="Key Metrics">
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={1.5}>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Market Cap</Typography>
                <Typography>${stock.marketCap.toLocaleString()}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">52-Week High</Typography>
                <Typography>${stock.high52}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">52-Week Low</Typography>
                <Typography>${stock.low52}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">P/E Ratio</Typography>
                <Typography>{stock.peRatio}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Div Yield</Typography>
                <Typography>{(stock.dividendYield * 100).toFixed(2)}%</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">EPS</Typography>
                <Typography>${stock.eps}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Beta</Typography>
                <Typography>{stock.beta}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Volume</Typography>
                <Typography>{stock.volume.toLocaleString()}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Open</Typography>
                <Typography>${stock.open}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">High</Typography>
                <Typography>${stock.high}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Low</Typography>
                <Typography>${stock.low}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Close</Typography>
                <Typography>${stock.close}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Latest Trading Day</Typography>
                <Typography>{stock.latestTradingDay}</Typography>
              </div>
            </Box>
          </DataCard>
          
          <DataCard title="Analyst Ratings">
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={1.5}>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Strong Buy</Typography>
                <Typography>{stock.analystRating.strongBuy}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Buy</Typography>
                <Typography>{stock.analystRating.buy}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Hold</Typography>
                <Typography>{stock.analystRating.hold}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Sell</Typography>
                <Typography>{stock.analystRating.sell}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" color="text.secondary">Strong Sell</Typography>
                <Typography>{stock.analystRating.strongSell}</Typography>
              </div>
            </Box>
          </DataCard>
          
          <DataCard title="Price Chart">
            <ChartComponent stock={stock} />
          </DataCard>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      {renderContent()}
    </Box>
  );
};

export default StockDashboard;