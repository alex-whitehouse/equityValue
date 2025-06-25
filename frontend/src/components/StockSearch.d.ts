declare module './StockSearch' {
  import React from 'react';
  
  interface StockSearchProps {
    onSearch: (symbol: string) => void;
    loading: boolean;
  }
  
  const StockSearch: React.FC<StockSearchProps>;
  export default StockSearch;
}
