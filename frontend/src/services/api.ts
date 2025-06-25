import axios from 'axios';
import type { StockOverview } from '../types/stock';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced to return error messages from backend
export const searchStocks = async (keywords: string) => {
  try {
    const response = await api.get('/search', { params: { keywords } });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract backend error message if available
      const serverMessage = error.response?.data?.error || error.response?.data?.message;
      throw new Error(serverMessage || 'Failed to search stocks');
    }
    throw new Error('Failed to search stocks');
  }
};

import { parseAlphaVantageOverviewResponse } from './alphaVantageParser';

export const fetchStockOverview = async (
  symbol: string,
  forceRefresh: boolean = false
): Promise<StockOverview> => {
  // Check cache first
  const cached = cache.get(symbol);
  if (cached && !forceRefresh && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  try {
    const response = await api.get(`/overview/${symbol}`);
    console.debug(`[DEBUG] API response for ${symbol}:`, response.data);
    
    // Parse and validate the response
    const parsedData = parseAlphaVantageOverviewResponse(response.data);
    
    // Cache with expiration
    cache.set(symbol, {
      data: parsedData,
      timestamp: Date.now()
    });
    
    return parsedData;
  } catch (error) {
    let errorMessage = 'Failed to fetch stock overview';
    
    if (axios.isAxiosError(error)) {
      // Enhanced Axios error handling
      const status = error.response?.status;
      const serverMessage = error.response?.data?.error || error.response?.data?.message;
      
      if (serverMessage) {
        errorMessage += `: ${serverMessage}`;
      } else if (status) {
        errorMessage += `: HTTP ${status}`;
      }
      
      console.error(`[ERROR] API request failed for ${symbol}: ${errorMessage}`);
      console.debug('[DEBUG] Full error response:', error.response);
    } else {
      errorMessage += `: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[ERROR] Non-Axios error for ${symbol}:`, error);
    }
    
    // Return cached data if available on error
    if (cached) {
      console.warn(`Returning cached data for ${symbol} due to API error`);
      return cached.data;
    }
    
    throw new Error(errorMessage);
  }
};