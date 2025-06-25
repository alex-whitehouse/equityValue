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
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(cachedData)
    };

    const params = { function: 'OVERVIEW', symbol };
    const overviewData = await fetchAlphaVantageData(params);
    
    await setInCache(cacheKey, overviewData, 3600); // 1 hour TTL
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(overviewData)
    };
  } catch (error) {
    console.error('Overview error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
// SELinux context fix applied at ${new Date().toISOString()}
// Template update applied at ${new Date().toISOString()}