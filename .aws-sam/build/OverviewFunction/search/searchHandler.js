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
  
  // Create response helper
  const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });

  try {
    const { keywords } = event.queryStringParameters || {};
    if (!keywords) {
      return response(400, { error: 'Missing keywords parameter' });
    }
    
    const cacheKey = `SEARCH_${keywords}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return response(200, cachedData);

    const params = { function: 'SYMBOL_SEARCH', keywords };
    const apiResponse = await fetchAlphaVantageData(params);
    
    console.log('Raw Alpha Vantage response:', JSON.stringify(apiResponse, null, 2));
    
    // Handle AlphaVantage API errors
    if (apiResponse['Error Message']) {
      return response(400, {
        error: 'AlphaVantage API error',
        message: apiResponse['Error Message']
      });
    }
    
    // Handle demo key limitations
    if (apiResponse.Information && apiResponse.Information.includes('demo')) {
      return response(429, {
        error: 'API rate limit exceeded',
        message: 'The demo API key has strict rate limits. Please use a valid API key.'
      });
    }
    
    if (!apiResponse.bestMatches) {
      console.log('No bestMatches found in response');
      return response(200, []);
    }

    // Transform and sort results
    const searchResults = apiResponse.bestMatches
      .map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        matchScore: parseFloat(match['9. matchScore'])
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('Transformed search results:', JSON.stringify(searchResults, null, 2));
    
    await setInCache(cacheKey, searchResults, 3600); // 1 hour TTL
    return response(200, searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return response(500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};// Deployment trigger: Tue 24 Jun 22:01:42 BST 2025
