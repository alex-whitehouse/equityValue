#!/bin/bash

# Validate environment variables
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
  echo "Error: ALPHA_VANTAGE_API_KEY environment variable must be set"
  exit 1
fi

# Build and deploy backend with environment variables
echo "Building and deploying backend with API key..."
sam build
sam deploy --parameter-overrides AlphaVantageApiKey=$ALPHA_VANTAGE_API_KEY

# Get API endpoint from deployment output
echo "Extracting API endpoint..."
SEARCH_API=$(aws cloudformation describe-stacks \
  --stack-name asicMargin-app \
  --query 'Stacks[0].Outputs[?OutputKey==`SearchApi`].OutputValue' \
  --output text)

if [ -z "$SEARCH_API" ]; then
  echo "Error: Failed to extract API endpoint. Deployment may have failed."
  exit 1
fi

# Derive base URL from search endpoint
BASE_URL=$(echo "$SEARCH_API" | sed 's|/search$||')
echo "API_BASE_URL=$BASE_URL"

# Update frontend environment configuration
echo "Updating frontend environment configuration..."
echo "VITE_API_BASE_URL=$BASE_URL" > frontend/.env.production
echo "VITE_API_BASE_URL=$BASE_URL" > frontend/.env.development

echo "Deployment complete! API base URL: $BASE_URL"
echo "Run frontend locally with: npm run dev"