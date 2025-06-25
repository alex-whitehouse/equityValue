import type { StockOverview } from '../types/stock';

// Helper function for safe number parsing with error handling
function parseNumber(value: any, fieldName: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    console.warn(`Missing value for field: ${fieldName}`);
    return undefined;
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    console.warn(`Invalid numeric value for field ${fieldName}: '${value}'`);
    return undefined;
  }
  return num;
}

export function parseAlphaVantageOverviewResponse(data: any): StockOverview {
  try {
    console.debug('[DEBUG] Parsing AlphaVantage response:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid API response: expected object');
    }
    
    // Validate required fields
    const requiredFields = ['Symbol', 'Name', 'Sector', 'Industry'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Make all fields optional - return undefined for missing/invalid values
    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseNumber(data.MarketCapitalization, 'MarketCapitalization'),
      high52: parseNumber(data['52WeekHigh'], '52WeekHigh'),
      low52: parseNumber(data['52WeekLow'], '52WeekLow'),
      peRatio: parseNumber(data.PERatio, 'PERatio'),
      dividendYield: parseNumber(data.DividendYield, 'DividendYield'),
      eps: parseNumber(data.EPS, 'EPS'),
      revenue: parseNumber(data.RevenueTTM, 'RevenueTTM'),
      profitMargin: parseNumber(data.ProfitMargin, 'ProfitMargin'),
      analystTargetPrice: parseNumber(data.AnalystTargetPrice, 'AnalystTargetPrice'),
      beta: parseNumber(data.Beta, 'Beta'),
        
      // Fields not in AlphaVantage response - set to defaults
      analystRating: {
        strongBuy: 0,
        buy: 0,
        hold: 0,
        sell: 0,
        strongSell: 0
      },
      volume: 0,
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      latestTradingDay: '',
      
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('[ERROR] Failed to parse AlphaVantage response:', error);
    throw new Error(`Parsing failed: ${(error as Error).message}`);
  }
}