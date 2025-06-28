#!/bin/bash

# Install dependencies for search function
echo "Installing dependencies for search function..."
cd backend/search
npm install
npm test
cd ../..

# Install dependencies for overview function
echo "Installing dependencies for overview function..."
cd backend/overview
npm install
npm test
cd ../..

# Install jq for JSON parsing
sudo apt-get install -y jq

# Install AWS SAM CLI if not already installed
if ! command -v sam &> /dev/null; then
    echo "Installing AWS SAM CLI..."
    pip install aws-sam-cli
fi

# Start local API
echo "Starting local API..."
sam local start-api