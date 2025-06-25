import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import StockDashboard from './components/StockDashboard';
import { Box, Container, Typography, Chip, Paper, List, ListItem, ListItemText } from '@mui/material';
import type { StockSearchResult } from './types/stock';

function App() {
  const [portfolio, setPortfolio] = useState<StockSearchResult[]>([]);
  const navigate = useNavigate();

  const handleSelectStock = (stock: StockSearchResult) => {
    // Check if stock already exists in portfolio
    if (!portfolio.some(item => item.symbol === stock.symbol)) {
      setPortfolio([...portfolio, stock]);
    }
    // Navigate to stock overview
    navigate(`/overview/${stock.symbol}`);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Box mb={4}>
        <SearchBar onSelectStock={handleSelectStock} />
      </Box>

      {portfolio.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Your Portfolio</Typography>
          <Paper elevation={2} style={{ padding: '16px' }}>
            <List>
              {portfolio.map(stock => (
                <ListItem key={stock.symbol} divider>
                  <ListItemText
                    primary={stock.symbol}
                    secondary={stock.name}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      <Routes>
        <Route path="/overview/:symbol" element={<StockDashboard />} />
        <Route path="/" element={
          <Typography variant="body1">
            Search for a stock to see its dashboard. Selected stocks will appear in your portfolio.
          </Typography>
        } />
      </Routes>
    </Container>
  );
}

export default App;
