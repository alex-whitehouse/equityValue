import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography, CircularProgress, Skeleton } from '@mui/material';
import { fetchStockOverview } from '../services/api';
import type { StockOverview } from '../types/stock';
import StockOverviewCard from './StockOverviewCard';
import ChartComponent from './ChartComponent';
import StockSearch from './StockSearch';
import PortfolioManager from './PortfolioManager';
import NavBar from './NavBar';
import { useTheme as useAppTheme } from '../context/ThemeContext';

const StockDashboard: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const { isDarkMode } = useAppTheme();

  const handleSearch = async (searchSymbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const stockData = await fetchStockOverview(searchSymbol);
      setStock(stockData);
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioToggle = (show: boolean) => {
    setShowPortfolio(show);
  };

  useEffect(() => {
    if (symbol) {
      handleSearch(symbol);
    } else {
      setLoading(false);
    }
  }, [symbol]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? 'background.default' : 'grey.100',
    }}>
      <NavBar onPortfolioToggle={handlePortfolioToggle} />
      
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto',
        p: 3
      }}>
        <Box sx={{ 
          backgroundColor: isDarkMode ? 'background.paper' : '#fff',
          borderRadius: 'shape.borderRadius',
          boxShadow: 1,
          overflow: 'hidden',
          mb: 3
        }}>
          <Box sx={{ p: 3 }}>
            <StockSearch onSearch={handleSearch} loading={loading} />
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={showPortfolio ? 8 : 12}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Box sx={{ mt: 2 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}

            {!loading && !error && stock && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StockOverviewCard
                    overview={stock}
                    loading={false}
                    error={null}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ChartComponent
                    stock={stock}
                    loading={false}
                    error={null}
                  />
                </Grid>
              </Grid>
            )}

            {!loading && !error && !stock && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 300,
                textAlign: 'center',
                mt: 4
              }}>
                <Typography variant="h6" color="text.secondary">
                  Search for a stock symbol to get started
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Try searching for "AAPL", "MSFT", or "GOOGL"
                </Typography>
              </Box>
            )}
          </Grid>
          
          {showPortfolio && (
            <Grid item xs={12} md={4}>
              <PortfolioManager />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default StockDashboard;