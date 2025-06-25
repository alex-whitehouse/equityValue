#!/bin/bash

# Get API base URL from frontend config
BASE_URL=$(grep -E '^VITE_API_BASE_URL=' frontend/.env.production | cut -d '=' -f2)

# Test multiple stock symbols
symbols=("AAPL" "MSFT" "TSLA" "INVALID")

echo "Testing API at: $BASE_URL"
echo "========================================"

for symbol in "${symbols[@]}"; do
  echo -e "\nTesting symbol: $symbol"
  curl -s -X GET "$BASE_URL/overview/$symbol" | jq .
  echo -e "\n----------------------------------------"
done

echo -e "\nTest complete"