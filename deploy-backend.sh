#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Validate environment variables
if [ -z "$ALPHA_VANTAGE_API_KEY" ]; then
  read -p "Enter your Alpha Vantage API key: " ALPHA_VANTAGE_API_KEY
  export ALPHA_VANTAGE_API_KEY
fi

# Create Cognito resources
echo "Creating Cognito resources..."
COGNITO_USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool --pool-name asicMarginUserPool --auto-verified-attributes email --username-attributes email)
COGNITO_USER_POOL_ID=$(echo "$COGNITO_USER_POOL_OUTPUT" | jq -r '.UserPool.Id' || echo "")
# Generate client with secret
COGNITO_APP_CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client --user-pool-id "$COGNITO_USER_POOL_ID" --client-name asicMarginAppClient --generate-secret --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH)
COGNITO_APP_CLIENT_ID=$(echo "$COGNITO_APP_CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientId')
COGNITO_APP_CLIENT_SECRET=$(echo "$COGNITO_APP_CLIENT_OUTPUT" | jq -r '.UserPoolClient.ClientSecret')

# Verify Cognito IDs were captured
if [ -z "$COGNITO_USER_POOL_ID" ] || [ -z "$COGNITO_APP_CLIENT_ID" ]; then
  echo "Error: Failed to create Cognito resources"
  exit 1
fi

# Setup SSM parameters
echo "Setting up SSM parameters..."
"$SCRIPT_DIR/scripts/setup-parameters.sh" "$COGNITO_USER_POOL_ID" "$COGNITO_APP_CLIENT_ID" "$COGNITO_APP_CLIENT_SECRET" "$ALPHA_VANTAGE_API_KEY"

# Debug: Print Cognito IDs (excluding secret for security)
echo "Cognito User Pool ID: $COGNITO_USER_POOL_ID"
echo "Cognito App Client ID: $COGNITO_APP_CLIENT_ID"

# Build and deploy backend with optimized packaging
echo "Building and deploying backend with optimized packaging..."
sam build --template-file "$SCRIPT_DIR/template.yaml" \
  --exclude "frontend/*" \
  --exclude "scripts/*" \
  --exclude "*.sh" \
  --exclude "*.md"

# Create S3 bucket for deployment artifacts
ARTIFACTS_BUCKET="asic-margin-artifacts-$(date +%s)"
aws s3 mb "s3://$ARTIFACTS_BUCKET" --region eu-west-2

# Deploy with the created bucket
sam deploy --s3-bucket "$ARTIFACTS_BUCKET" \
  --template-file "$SCRIPT_DIR/template.yaml" \
  --stack-name asicMargin-app \
  --capabilities CAPABILITY_IAM

# Get API base URL from deployment output
echo "Extracting API base URL..."
API_BASE_URL=$(aws cloudformation describe-stacks \
  --stack-name asicMargin-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ServerlessRestApi`].OutputValue' \
  --output text | sed 's|/.*||')

if [ -z "$API_BASE_URL" ]; then
  echo "Error: Failed to extract API base URL. Deployment may have failed."
  exit 1
fi

echo "API_BASE_URL=$API_BASE_URL"

# Update frontend environment configuration
echo "Updating frontend environment configuration..."
{
  echo "VITE_API_BASE_URL=$BASE_URL"
  echo "VITE_USER_POOL_ID=$COGNITO_USER_POOL_ID"
  echo "VITE_USER_POOL_CLIENT_ID=$COGNITO_APP_CLIENT_ID"
} > frontend/.env

# Also create production-specific file for future use
{
  echo "VITE_API_BASE_URL=$BASE_URL"
  echo "VITE_USER_POOL_ID=$COGNITO_USER_POOL_ID"
  echo "VITE_USER_POOL_CLIENT_ID=$COGNITO_APP_CLIENT_ID"
} > frontend/.env.production

echo "Deployment complete! API base URL: $BASE_URL"
echo "Run frontend locally with: npm run dev"