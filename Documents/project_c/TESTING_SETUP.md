# Testing Setup - Backend & Frontend Integration

## 🚀 Current Status

✅ **Backend Server**: Running on `http://localhost:3001`
✅ **Frontend Dashboard**: Running on `http://localhost:3000`
✅ **PostgreSQL Database**: Running in Docker
✅ **Ngrok Tunnel**: Publicly accessible
✅ **Frontend-Backend Integration**: Connected and working

## 🌐 Public URLs (for Maxpay Webhooks)

### Backend API (via ngrok)
```
https://unlackeyed-spireless-deangelo.ngrok-free.dev
```

### Maxpay Webhook Endpoint
```
POST https://unlackeyed-spireless-deangelo.ngrok-free.dev/webhook/maxpay
```

### Health Check Endpoint
```
GET https://unlackeyed-spireless-deangelo.ngrok-free.dev/health
```

## 📡 API Endpoints Available

### Transactions
- `GET /transactions` - List all transactions
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/reference/:referenceId` - Get transaction by reference ID

### Withdrawals
- `POST /withdraw` - Process a new withdrawal

### Webhooks
- `POST /webhook/maxpay` - Maxpay webhook callback

### Health
- `GET /health` - Server health check

## 🧪 Testing with Maxpay

### Maxpay Callback 2.0 Format

The backend supports Maxpay Callback 2.0 format. Here's the webhook payload structure:

```json
{
    "uniqueTransactionId": "hpp180926125439m7059a4040uf62e5bb29b97bc",
    "reference": "YOUR_REFERENCE_ID",
    "uniqueUserId": "auto_AH1IqGXIu555VyLF",
    "totalAmount": 100,
    "currency": "USD",
    "transactionType": "SALE",
    "status": "success|failed|pending",
    "message": "Transaction processed successfully",
    "code": 0,
    "productList": [
        {
            "productId": "p_6e30432104",
            "name": "Product name",
            "amount": 100,
            "currency": "USD"
        }
    ],
    "testMode": "0|1"
}
```

**Important:**
- `code: 0` = Success
- `code: -20` (or any non-zero) = Failed
- The webhook uses the `reference` field to find your original transaction

### 1. Create a Withdrawal Transaction
```bash
curl -X POST https://unlackeyed-spireless-deangelo.ngrok-free.dev/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "referenceId": "TEST-'$(date +%s)'",
    "amount": 100.00,
    "currency": "USD",
    "gateway": "maxpay"
  }'
```

### 2. Maxpay Webhook Configuration

Configure your Maxpay account to send webhook callbacks to:
```
https://unlackeyed-spireless-deangelo.ngrok-free.dev/webhook/maxpay
```

### 3. Test Webhook Manually

**Success Transaction:**
```bash
curl -X POST https://unlackeyed-spireless-deangelo.ngrok-free.dev/webhook/maxpay \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueTransactionId": "hpp180926125439m7059a4040uf62e5bb29b97bc",
    "reference": "YOUR_REFERENCE_ID",
    "uniqueUserId": "auto_AH1IqGXIu555VyLF",
    "totalAmount": 100,
    "currency": "USD",
    "transactionType": "SALE",
    "status": "success",
    "message": "Transaction processed successfully",
    "code": 0,
    "productList": [
        {
            "productId": "p_6e30432104",
            "name": "Trial product",
            "amount": 100,
            "currency": "USD"
        }
    ],
    "testMode": "0"
}'
```

**Failed Transaction:**
```bash
curl -X POST https://unlackeyed-spireless-deangelo.ngrok-free.dev/webhook/maxpay \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueTransactionId": "hpp180926125439m7059a4040uf62e5bb29b97bc",
    "reference": "YOUR_REFERENCE_ID",
    "uniqueUserId": "auto_AH1IqGXIu555VyLF",
    "totalAmount": 100,
    "currency": "USD",
    "transactionType": "SALE",
    "status": "failed",
    "message": "Insufficient funds",
    "code": -20,
    "productList": [
        {
            "productId": "p_6e30432104",
            "name": "Trial product",
            "amount": 100,
            "currency": "USD"
        }
    ],
    "testMode": "0"
}'
```

## 🎯 Frontend Dashboard

Access the admin dashboard at:
```
http://localhost:3000
```

### Pages Available
- **Dashboard** (`/`) - Overview statistics
- **Transactions** (`/transactions`) - Transaction list
- **Transaction Details** (`/transactions/[id]`) - Transaction details
- **Cases** (`/cases`) - Error/issue management (still using mock data)
- **Accounts** (`/accounts`) - Gateway accounts (still using mock data)
- **Settings** (`/settings`) - Configuration (still using mock data)

### Features Implemented
✅ Real-time transaction listing from backend
✅ Transaction details view
✅ Dashboard statistics calculated from real data
✅ Refresh buttons to reload data
✅ Loading states and error handling
✅ Responsive design

### Features Using Mock Data (To be implemented)
- Cases/Issues management
- Gateway accounts management
- Settings configuration
- Transaction retry functionality
- Create new transaction form

## 🔧 Development Setup

### Backend
```bash
cd auto-withdraw-backend
npm run dev
```

### Frontend
```bash
cd payment-admin-dashboard
npm run dev
```

### Ngrok (if needed)
```bash
ngrok http 3001
```

### PostgreSQL (Docker)
```bash
cd auto-withdraw-backend
docker-compose up -d
```

## 📝 Notes

1. **Frontend API URL**: The frontend is currently configured to use the ngrok URL for public access. To switch back to local development, edit `payment-admin-dashboard/src/lib/api.ts` and change `API_BASE_URL` to `'http://localhost:3001'`.

2. **Ngrok URL**: The ngrok URL `https://unlackeyed-spireless-deangelo.ngrok-free.dev` will change each time ngrok restarts. Update the configuration accordingly.

3. **Database**: All transactions are stored in PostgreSQL running in Docker. Data persists between restarts.

4. **Maxpay Integration**: The Maxpay adapter is currently in development mode and returns mock responses. For production, update `auto-withdraw-backend/src/gateways/maxpay.adapter.ts` with actual Maxpay API calls.

## 🐛 Troubleshooting

### Frontend not loading data?
- Check that backend is running: `curl http://localhost:3001/health`
- Check that ngrok is running: `curl https://unlackeyed-spireless-deangelo.ngrok-free.dev/health`
- Check browser console for CORS errors

### Ngrok not working?
- Restart ngrok: `pkill ngrok && ngrok http 3001`
- Get new URL: `curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'`
- Update frontend API URL

### Database issues?
- Check Docker container: `docker ps`
- View logs: `docker-compose logs postgres`
- Restart PostgreSQL: `docker-compose restart postgres`

## 📚 Documentation

- **Backend API**: `auto-withdraw-backend/docs/API.md`
- **Integration Guide**: `auto-withdraw-backend/docs/INTEGRATION.md`
- **Backend README**: `auto-withdraw-backend/README.md`
- **Frontend README**: `payment-admin-dashboard/README.md`

---

**Last Updated**: 2026-02-12
**Environment**: Development