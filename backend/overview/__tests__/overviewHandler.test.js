const { handler } = require('../overviewHandler');
const { getFromCache, setInCache } = require('../../shared/cacheManager');
const { fetchAlphaVantageData } = require('../../shared/alphaVantageClient');

jest.mock('../../shared/cacheManager');
jest.mock('../../shared/alphaVantageClient');

describe('overviewHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when symbol path parameter is missing', async () => {
    const event = { pathParameters: {} };
    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return cached data when available', async () => {
    const cachedData = { Symbol: 'TEST', Name: 'Test Inc' };
    getFromCache.mockResolvedValue(cachedData);
    
    const event = { pathParameters: { symbol: 'TEST' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(cachedData);
    expect(fetchAlphaVantageData).not.toHaveBeenCalled();
  });

  it('should fetch from API and cache when no cache exists', async () => {
    const apiData = { Symbol: 'TEST', Name: 'Test Inc' };
    fetchAlphaVantageData.mockResolvedValue(apiData);
    
    const event = { pathParameters: { symbol: 'TEST' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(apiData);
    expect(setInCache).toHaveBeenCalledWith('OVERVIEW_TEST', apiData, 3600);
  });

  it('should return 500 on API failure', async () => {
    fetchAlphaVantageData.mockRejectedValue(new Error('API error'));
    
    const event = { pathParameters: { symbol: 'TEST' } };
    const response = await handler(event);
    
    expect(response.statusCode).toBe(500);
  });
});