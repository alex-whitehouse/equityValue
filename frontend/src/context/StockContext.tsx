import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { StockSearchResult, StockOverview } from '../types/stock';

interface StockContextType {
  selectedStock: StockSearchResult | null;
  overviewData: StockOverview | null;
  loading: boolean;
  error: string | null;
  fetchOverview: (symbol: string, forceRefresh?: boolean) => Promise<void>;
}

const StockContext = createContext<StockContextType>({
  selectedStock: null,
  overviewData: null,
  loading: false,
  error: null,
  fetchOverview: async () => {}
});

export const useStockContext = () => useContext(StockContext);

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [overviewData, setOverviewData] = useState<StockOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async (symbol: string, forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStockOverview(symbol, forceRefresh);
      setOverviewData(data);
      setSelectedStock({ symbol: data.symbol, name: data.name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stock overview';
      setError(message);
      console.error('StockContext error:', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StockContext.Provider value={{
      selectedStock,
      overviewData,
      loading,
      error,
      fetchOverview
    }}>
      {children}
    </StockContext.Provider>
  );
};