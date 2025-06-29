import axios from 'axios';

// Create Axios instance with base URL and headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://${ServerlessRestApi}.execute-api.eu-west-2.amazonaws.com/Prod',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API request failed:', error);
    
    // Map HTTP status codes to Cognito-like errors
    const statusMap: Record<number, string> = {
      400: 'InvalidParameterException',
      401: 'NotAuthorizedException',
      403: 'UserNotConfirmedException',
      404: 'UserNotFoundException',
      409: 'UsernameExistsException',
      429: 'LimitExceededException'
    };
    
    const status = error.response?.status || 500;
    const errorName = statusMap[status] || 'InternalError';
    
    // Create Cognito-like error object
    const cognitoError = new Error(error.response?.data?.error || 'API request failed');
    cognitoError.name = errorName;
    
    return Promise.reject(cognitoError);
  }
);

// Stock search API
const searchStocks = async (keywords: string) => {
  try {
    const response = await api.get('/search', {
      params: { keywords }
    });
    return response.data;
  } catch (error) {
    console.error('Stock search failed:', error);
    throw new Error('Failed to search stocks');
  }
};

// Fetch stock overview
const fetchStockOverview = async (symbol: string) => {
  try {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stock overview:', error);
    throw new Error('Failed to fetch stock data');
  }
};

export { api, searchStocks, fetchStockOverview };