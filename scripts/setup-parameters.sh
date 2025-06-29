#!/bin/bash

set -e

# Check for required arguments
if [ $# -ne 4 ]; then
  echo "Usage: $0 <COGNITO_USER_POOL_ID> <COGNITO_APP_CLIENT_ID> <COGNITO_APP_CLIENT_SECRET> <ALPHA_VANTAGE_API_KEY>"
  exit 1
fi

COGNITO_USER_POOL_ID=$1
COGNITO_APP_CLIENT_ID=$2
COGNITO_APP_CLIENT_SECRET=$3
ALPHA_VANTAGE_API_KEY=$4

# Check AWS CLI availability
if ! command -v aws &> /dev/null; then
  echo "Error: AWS CLI is not installed. Please install and configure it."
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS credentials are not configured. Run 'aws configure' to set up credentials."
  exit 1
fi

# Create SSM parameters
aws ssm put-parameter \
  --name "/asic/cognito/userPoolId" \
  --value "$COGNITO_USER_POOL_ID" \
  --type String \
  --overwrite

aws ssm put-parameter \
  --name "/asic/cognito/appClientId" \
  --value "$COGNITO_APP_CLIENT_ID" \
  --type String \
  --overwrite

aws ssm put-parameter \
  --name "/asic/cognito/appClientSecret" \
  --value "$COGNITO_APP_CLIENT_SECRET" \
  --type SecureString \
  --overwrite

aws ssm put-parameter \
  --name "/asic/alphaVantage/apiKey" \
  --value "$ALPHA_VANTAGE_API_KEY" \
  --type String \
  --overwrite

# Verify parameters
echo "Verifying SSM parameters:"
aws ssm get-parameter --name "/asic/cognito/userPoolId" --query Parameter.Value --output text
aws ssm get-parameter --name "/asic/cognito/appClientId" --query Parameter.Value --output text
aws ssm get-parameter --name "/asic/cognito/appClientSecret" --with-decryption --query Parameter.Value --output text
aws ssm get-parameter --name "/asic/alphaVantage/apiKey" --query Parameter.Value --output text

echo "SSM parameters created successfully"