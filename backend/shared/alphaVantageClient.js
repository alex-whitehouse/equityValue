// Use dynamic import for node-fetch (ESM compatibility)
const fetchPromise = import('node-fetch').then(module => module.default);

exports.fetchAlphaVantageData = async (params) => {
  try {
    let apiKey;
    
    // Use local API key if set, otherwise try to get from SSM
    if (process.env.ALPHA_VANTAGE_API_KEY) {
      apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    } else if (process.env.ALPHA_VANTAGE_API_KEY_PARAM) {
      const AWS = require('aws-sdk');
      const ssm = new AWS.SSM();
      
      const ssmResponse = await ssm.getParameter({
        Name: process.env.ALPHA_VANTAGE_API_KEY_PARAM,
        WithDecryption: true
      }).promise();
      
      apiKey = ssmResponse.Parameter.Value;
    } else {
      throw new Error('Alpha Vantage API key not configured');
    }
    const url = new URL('https://www.alphavantage.co/query');
    Object.entries({ ...params, apikey: apiKey }).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Use dynamically imported fetch
    const fetch = await fetchPromise;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    
    return await response.json();
  } catch (error) {
    console.error('AlphaVantage API error:', error);
    throw error;
  }
};