#!/bin/bash

# Build and deploy backend
echo "Building and deploying backend..."
sam build
sam deploy 

# Get API endpoint from deployment output
echo "Extracting API endpoint..."
# Extract Search API endpoint
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

echo "Deployment complete! API endpoint: $API_ENDPOINT"
echo "Run frontend locally with: npm run dev"