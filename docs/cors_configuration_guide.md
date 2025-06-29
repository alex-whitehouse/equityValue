# AWS CORS Configuration Guide

## 1. API Gateway Configuration
1. Open [API Gateway Console](https://console.aws.amazon.com/apigateway)
2. Select your REST API (asicMarginAPI)
3. In Resources panel:
   - Select `/auth` resource
   - Click "Enable CORS"
4. Configure CORS settings:
   ```
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: 'Content-Type, Authorization, *'
   Access-Control-Allow-Credentials: 'true'
   ```
5. Click "Save" and confirm gateway changes
6. Deploy API to desired stage

## 2. OPTIONS Method Setup
1. In API Gateway → Resources → /auth:
   - Create new OPTIONS method
2. Setup integration:
   ```
   Integration type: MOCK
   Request Templates: { "application/json": "{statusCode:200}" }
   ```
3. Configure method response:
   - Add 200 status code
   - Add headers:
     ```
     Access-Control-Allow-Origin
     Access-Control-Allow-Methods
     Access-Control-Allow-Headers
     Access-Control-Allow-Credentials
     Access-Control-Max-Age
     ```
4. Configure integration response:
   - Set header mappings:
     ```
     method.response.header.Access-Control-Allow-Origin: 'http://localhost:5173'
     method.response.header.Access-Control-Allow-Methods: 'POST, OPTIONS'
     method.response.header.Access-Control-Allow-Headers: 'Content-Type, Authorization, *'
     method.response.header.Access-Control-Allow-Credentials: 'true'
     method.response.header.Access-Control-Max-Age: '7200'
     ```

## 3. Cognito Configuration
1. Open [Cognito Console](https://console.aws.amazon.com/cognito)
2. Select your user pool (asicMarginUserPool)
3. Navigate to "App client settings"
4. Configure:
   ```
   Callback URL(s): http://localhost:5173
   Allowed OAuth Flows: Authorization code grant, Implicit grant
   Allowed OAuth Scopes: email, openid, profile
   ```
5. Save changes

## 4. Lambda Response Headers
Already configured in `authHandler.js`:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, *',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

## Verification Steps
1. Test preflight request:
```bash
curl -X OPTIONS https://your-api-id.execute-api.region.amazonaws.com/prod/auth \
-H "Origin: http://localhost:5173" \
-H "Access-Control-Request-Method: POST" \
-v
```
2. Check response contains:
```
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Credentials: true
```
3. Test authenticated request from frontend

## Important Notes
- After configuration changes, redeploy API Gateway
- Clear browser cache when testing CORS changes
- Ensure frontend sends `credentials: 'include'` in fetch requests
- For production, replace `http://localhost:5173` with your actual domain