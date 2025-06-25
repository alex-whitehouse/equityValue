const { fetchAlphaVantageData } = require('../shared/alphaVantageClient');
const { getFromCache, setInCache } = require('../shared/cacheManager');

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,OPTIONS'
};

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  try {
    const { symbol } = event.pathParameters || {};
    if (!symbol) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing symbol path parameter' }) };
    }

    const cacheKey = `OVERVIEW_${symbol}`;
    const cacheStart = Date.now();
    const cachedData = await getFromCache(cacheKey);
    const cacheTime = Date.now() - cacheStart;
    
    if (cachedData) {
      console.log(`[CACHE] Cache hit for ${symbol} (${cacheTime}ms)`);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(cachedData)
      };
    }
    console.log(`[CACHE] Cache miss for ${symbol} (${cacheTime}ms)`);

    const params = { function: 'OVERVIEW', symbol };
    console.debug(`[API] Fetching AlphaVantage data for ${symbol}`);
    const apiStart = Date.now();
    
    try {
      const overviewData = await fetchAlphaVantageData(params);
      const apiTime = Date.now() - apiStart;
      console.log(`[API] Fetched ${symbol} in ${apiTime}ms`);

      // Basic response validation
      if (!overviewData || Object.keys(overviewData).length === 0) {
        throw new Error('Empty response from AlphaVantage API');
      }
      if (overviewData.Note || overviewData.Information) {
        throw new Error(`API limit reached: ${overviewData.Note || overviewData.Information}`);
      }

      const cacheSetStart = Date.now();
      await setInCache(cacheKey, overviewData, 3600); // 1 hour TTL
      console.log(`[CACHE] Set cache for ${symbol} in ${Date.now() - cacheSetStart}ms`);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(overviewData)
      };
    } catch (error) {
      const apiTime = Date.now() - apiStart;
      console.error(`[API] Failed to fetch ${symbol} after ${apiTime}ms:`, error.message);
      throw error; // Rethrow for outer catch block
    }
  } catch (error) {
    console.error('Overview error:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message.includes('API limit reached')) {
      errorMessage = 'AlphaVantage API rate limit exceeded';
      statusCode = 429;
    } else if (error.message.includes('Empty response')) {
      errorMessage = 'AlphaVantage returned empty data for this symbol';
      statusCode = 404;
    } else if (error.message.includes('API key')) {
      errorMessage = 'AlphaVantage API configuration error';
      statusCode = 500;
    }
    
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
// SELinux context fix applied at ${new Date().toISOString()}
// Template update applied at ${new Date().toISOString()}