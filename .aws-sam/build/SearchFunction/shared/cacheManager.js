const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.CACHE_TABLE_NAME || 'AlphaVantageCache';

exports.getFromCache = async (cacheKey) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Key: { cacheKey },
    };
    const result = await docClient.get(params).promise();
    return result.Item ? result.Item.data : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

exports.setInCache = async (cacheKey, data, ttlSeconds) => {
  try {
    const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;
    const params = {
      TableName: TABLE_NAME,
      Item: { cacheKey, data, ttl },
    };
    await docClient.put(params).promise();
  } catch (error) {
    console.error('Cache set error:', error);
  }
};