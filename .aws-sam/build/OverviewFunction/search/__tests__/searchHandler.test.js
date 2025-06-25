const { handler } = require('../searchHandler');
const { getFromCache, setInCache } = require('../../shared/cacheManager');
const { fetchAlphaVantageData } = require('../../shared/alphaVantageClient');

jest.mock('../../shared/cacheManager');
jest.mock('../../shared/alphaVantageClient');

describe('searchHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when query parameter is missing', async () => {
    const event = { queryStringParameters: {} };
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return cached data when available', async () => {
    const cachedData = [{ symbol: 'TEST', name: 'Test Inc' }];
    getFromCache.mockResolvedValue(cachedData);
    
    const event = { queryStringParameters: { query: 'test' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(cachedData);
    expect(fetchAlphaVantageData).not.toHaveBeenCalled();
  });

  it('should fetch from API and cache when no cache exists', async () => {
    const apiData = { bestMatches: [{ symbol: 'TEST', name: 'Test Inc' }] };
    fetchAlphaVantageData.mockResolvedValue(apiData);
    
    const event = { queryStringParameters: { query: 'test' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(apiData);
    expect(setInCache).toHaveBeenCalledWith('SEARCH_test', apiData, 3600);
  });

  it('should return 500 on API failure', async () => {
    fetchAlphaVantageData.mockRejectedValue(new Error('API error'));
    
    const event = { queryStringParameters: { query: 'test' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(500);
  });
});