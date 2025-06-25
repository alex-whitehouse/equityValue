import React from 'react';
import { StockOverview } from '../types/stock';

interface ChartProps {
  stock: StockOverview;
}

declare const ChartComponent: React.FC<ChartProps>;
export default ChartComponent;