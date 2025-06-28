# ASIC Margin Stock Analysis Platform

## Overview
This project provides a comprehensive stock analysis platform that integrates with Alpha Vantage API for real-time stock data.

## Features
- Real-time stock data retrieval
- Portfolio management
- Technical analysis tools
- User authentication via AWS Cognito

## Installation
```bash
./setup.sh
```

## Configuration
### Setting up SSM Parameters
1. Create Cognito User Pool and note the Pool ID
2. Create Cognito App Client and note the Client ID
3. Obtain Alpha Vantage API key

Run the parameter setup script:
```bash
./scripts/setup-parameters.sh <USER_POOL_ID> <APP_CLIENT_ID> <ALPHA_VANTAGE_API_KEY>
```

The script will:
- Validate AWS CLI availability and credentials
- Create/update SSM parameters
- Verify parameter creation

Example output:
```
Verifying SSM parameters:
us-east-1_123456789
abcdefghijklmnopqrstuvwxyz
0123456789ABCDEF
SSM parameters created successfully
```

## Deployment
```bash
./deploy-backend.sh
```

## Testing
```bash
./test_stock_symbols.sh
