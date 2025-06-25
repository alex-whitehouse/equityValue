import type { StockOverview } from '../types/stock';

export function parseAlphaVantageOverviewResponse(data: any): StockOverview {
  // Basic validation
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid API response: expected object');
  }

  // Required fields
  const requiredFields = ['Symbol', 'Name', 'Description', 'Sector', 'Industry',
    'MarketCapitalization', '52WeekHigh', '52WeekLow', 'PERatio', 'DividendYield', 'EPS',
    'RevenueTTM', 'ProfitMargin', 'AnalystTargetPrice',
    'RatingStrongBuy', 'RatingBuy', 'RatingHold', 'RatingSell', 'RatingStrongSell',
    'Beta', 'Volume', 'Open', 'High', 'Low', 'Close', 'LatestTradingDay'];
  
  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return {
    symbol: data.Symbol,
    name: data.Name,
    description: data.Description,
    sector: data.Sector,
    industry: data.Industry,
    marketCap: parseFloat(data.MarketCapitalization),
    high52: parseFloat(data['52WeekHigh']),
    low52: parseFloat(data['52WeekLow']),
    peRatio: parseFloat(data.PERatio),
    dividendYield: parseFloat(data.DividendYield),
    eps: parseFloat(data.EPS),
    revenue: parseFloat(data.RevenueTTM),
    profitMargin: parseFloat(data.ProfitMargin),
    analystTargetPrice: parseFloat(data.AnalystTargetPrice),
    analystRating: {
      strongBuy: parseInt(data.RatingStrongBuy, 10),
      buy: parseInt(data.RatingBuy, 10),
      hold: parseInt(data.RatingHold, 10),
      sell: parseInt(data.RatingSell, 10),
      strongSell: parseInt(data.RatingStrongSell, 10)
    },
    beta: parseFloat(data.Beta),
    volume: parseFloat(data.Volume),
    open: parseFloat(data.Open),
    high: parseFloat(data.High),
    low: parseFloat(data.Low),
    close: parseFloat(data.Close),
    latestTradingDay: data.LatestTradingDay,
    lastUpdated: new Date()
  };
}