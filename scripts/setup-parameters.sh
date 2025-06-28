#!/bin/bash

set -e

# Check for required arguments
if [ $# -ne 3 ]; then
  echo "Usage: $0 <COGNITO_USER_POOL_ID> <COGNITO_APP_CLIENT_ID> <ALPHA_VANTAGE_API_KEY>"
  exit 1
fi

COGNITO_USER_POOL_ID=$1
COGNITO_APP_CLIENT_ID=$2
ALPHA_VANTAGE_API_KEY=$3

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
  --name "/asic/alphaVantage/apiKey" \
  --value "$ALPHA_VANTAGE_API_KEY" \
  --type String \
  --overwrite

# Verify parameters
echo "Verifying SSM parameters:"
aws ssm get-parameter --name "/asic/cognito/userPoolId" --query Parameter.Value --output text
aws ssm get-parameter --name "/asic/cognito/appClientId" --query Parameter.Value --output text
aws ssm get-parameter --name "/asic/alphaVantage/apiKey" --query Parameter.Value --output text

echo "SSM parameters created successfully"