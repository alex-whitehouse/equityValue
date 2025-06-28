#!/bin/bash

# Validate environment variables
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
  echo "Error: The following environment variable must be set:"
  echo "  ALPHA_VANTAGE_API_KEY"
  exit 1
fi

# Create Cognito resources
echo "Creating Cognito resources..."
COGNITO_USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool --pool-name asicMarginUserPool --auto-verified-attributes email --username-attributes email)
COGNITO_USER_POOL_ID=$(echo "$COGNITO_USER_POOL_OUTPUT" | jq -r '.UserPool.Id')
# Generate client with secret
COGNITO_APP_CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client --user-pool-id "$COGNITO_USER_POOL_ID" --client-name asicMarginAppClient --generate-secret --explicit-auth-flows "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH")
COGNITO_APP_CLIENT_ID=$(echo "$COGNITO_APP_CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientId')
COGNITO_APP_CLIENT_SECRET=$(echo "$COGNITO_APP_CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientSecret')

# Verify Cognito IDs were captured
if [ -z "$COGNITO_USER_POOL_ID" ] || [ -z "$COGNITO_APP_CLIENT_ID" ]; then
  echo "Error: Failed to create Cognito resources"
  exit 1
fi

# Setup SSM parameters
echo "Setting up SSM parameters..."
./scripts/setup-parameters.sh "$COGNITO_USER_POOL_ID" "$COGNITO_APP_CLIENT_ID" "$ALPHA_VANTAGE_API_KEY"

# Debug: Print Cognito IDs
echo "Cognito User Pool ID: $COGNITO_USER_POOL_ID"
echo "Cognito App Client ID: $COGNITO_APP_CLIENT_ID"

# Build and deploy backend
echo "Building and deploying backend..."
sam build
sam deploy

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
{
  echo "VITE_API_BASE_URL=$BASE_URL"
  echo "VITE_USER_POOL_ID=$COGNITO_USER_POOL_ID"
  echo "VITE_USER_POOL_CLIENT_ID=$COGNITO_APP_CLIENT_ID"
  echo "VITE_USER_POOL_CLIENT_SECRET=$COGNITO_APP_CLIENT_SECRET"
} > frontend/.env.production

{
  echo "VITE_API_BASE_URL=$BASE_URL"
  echo "VITE_USER_POOL_ID=$COGNITO_USER_POOL_ID"
  echo "VITE_USER_POOL_CLIENT_ID=$COGNITO_APP_CLIENT_ID"
  echo "VITE_USER_POOL_CLIENT_SECRET=$COGNITO_APP_CLIENT_SECRET"
} > frontend/.env.development

echo "Deployment complete! API base URL: $BASE_URL"
echo "Run frontend locally with: npm run dev"