import React, { useState } from 'react';
import { TextField, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  loading: boolean;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, loading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Search Stock Symbol"
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <SearchIcon />}
            </IconButton>
          )
        }}
      />
    </form>
  );
};

export default StockSearch;