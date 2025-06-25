import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Alert,
  Skeleton,
  ListItemButton,
  IconButton,
  InputAdornment,
  Chip,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import { searchStocks } from '../services/api';
import type { StockSearchResult } from '../types/stock';

interface SearchBarProps {
  onSelectStock: (stock: StockSearchResult) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<StockSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('stockSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('stockSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const addToHistory = useCallback((stock: StockSearchResult) => {
    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.symbol !== stock.symbol);
      // Add to beginning and limit to 10 items
      return [stock, ...filtered].slice(0, 10);
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setLoading(true);
      setError(null);
      searchStocks(query)
        .then(data => {
          setResults(data);
          setIsOpen(true);
          setLoading(false);
          setShowHistory(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to search stocks');
          setResults([]);
          setIsOpen(false);
          setLoading(false);
        });
    }
  }, [query]);

  useEffect(() => {
    const handler = setTimeout(handleSearch, 300);
    return () => clearTimeout(handler);
  }, [query, handleSearch]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
      setIsOpen(false);
      setError(null);
      inputRef.current?.focus();
  };

  const handleSelect = (stock: StockSearchResult) => {
    onSelectStock(stock);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    addToHistory(stock);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    setIsOpen(!showHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && (results.length > 0 || searchHistory.length > 0)) {
      e.preventDefault();
      const firstItem = document.getElementById('result-0');
      firstItem?.focus();
    } else if (e.key === 'Enter' && query.trim()) {
      handleSearch();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <TextField
        label="Search Stocks"
        variant="outlined"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onFocus={() => (results.length > 0 || searchHistory.length > 0) && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {query && (
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={toggleHistory} edge="end">
                <HistoryIcon fontSize="small" />
              </IconButton>
              {loading && <CircularProgress size={20} />}
            </InputAdornment>
          )
        }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {(isOpen && (results.length > 0 || searchHistory.length > 0 || loading)) && (
        <Paper sx={{
          position: 'absolute',
          width: '100%',
          zIndex: 1300,
          maxHeight: '300px',
          overflow: 'auto',
          mt: 0.5,
          boxShadow: 3
        }}>
          <List>
            {showHistory ? (
              <>
                <ListItem sx={{ py: 1, backgroundColor: 'action.hover' }}>
                  <ListItemText primary="Recent Searches" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItem>
                {searchHistory.length > 0 ? (
                  searchHistory.map((stock, index) => (
                    <ListItemButton
                      key={`history-${stock.symbol}`}
                      id={`result-${index}`}
                      onClick={() => handleSelect(stock)}
                    >
                      <ListItemText
                        primary={stock.symbol}
                        secondary={stock.name}
                      />
                      <Chip label="Recent" size="small" color="info" />
                    </ListItemButton>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No search history" />
                  </ListItem>
                )}
              </>
            ) : (
              <>
                {loading ? (
                  // Enhanced skeleton loading state
                  <>
                    <ListItem sx={{ py: 1.5 }}>
                      <Skeleton variant="rectangular" width="100%" height={40} animation="wave" />
                    </ListItem>
                    <ListItem sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Skeleton variant="circular" width={40} height={40} animation="wave" />
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Skeleton variant="text" width="40%" animation="wave" />
                          <Skeleton variant="text" width="60%" animation="wave" />
                        </Box>
                      </Box>
                    </ListItem>
                    <ListItem sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Skeleton variant="circular" width={40} height={40} animation="wave" />
                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                          <Skeleton variant="text" width="50%" animation="wave" />
                          <Skeleton variant="text" width="70%" animation="wave" />
                        </Box>
                      </Box>
                    </ListItem>
                  </>
                ) : results.length > 0 ? (
                  results.map((stock, index) => (
                    <ListItemButton
                      key={stock.symbol}
                      id={`result-${index}`}
                      onClick={() => handleSelect(stock)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const nextItem = document.getElementById(`result-${index + 1}`);
                          nextItem?.focus();
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          if (index === 0) {
                            inputRef.current?.focus();
                          } else {
                            const prevItem = document.getElementById(`result-${index - 1}`);
                            prevItem?.focus();
                          }
                        } else if (e.key === 'Enter') {
                          handleSelect(stock);
                        }
                      }}
                    >
                      <ListItemText
                        primary={stock.symbol}
                        secondary={stock.name}
                      />
                      {searchHistory.some(item => item.symbol === stock.symbol) && (
                        <Chip label="Recent" size="small" color="info" />
                      )}
                    </ListItemButton>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No results found" />
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;