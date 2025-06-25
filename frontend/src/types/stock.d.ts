export interface StockSearchResult {
  symbol: string;
  name: string;
}

export interface AnalystRating {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface StockOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap?: number;
  high52?: number;
  low52?: number;
  peRatio?: number;
  dividendYield?: number;
  eps?: number;
  revenue?: number;
  profitMargin?: number;
  analystTargetPrice?: number;
  beta?: number;
  lastUpdated: Date; // For caching
  
  // Optional fields not provided by AlphaVantage
  analystRating?: AnalystRating;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  latestTradingDay?: string;
}