# Quick Setup Guide

This guide will help you set up the Auto Withdraw Backend in less than 5 minutes.

## Step 1: Install Dependencies

```bash
cd auto-withdraw-backend
npm install
```

## Step 2: Start PostgreSQL with Docker

```bash
docker-compose up -d
```

**Wait 5-10 seconds** for PostgreSQL to start.

## Step 3: Run Database Schema

```bash
psql -h localhost -U postgres -d auto_withdraw_db -f src/database/schema.sql
```

When prompted, enter password: `postgres`

## Step 4: Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Step 5: Test the API

**Health Check:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T02:00:00.000Z",
  "service": "Auto Withdraw Backend"
}
```

**Process a Withdrawal:**
```bash
curl -X POST http://localhost:3001/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "referenceId": "TEST-001",
    "amount": 100.50,
    "currency": "USD",
    "gateway": "maxpay"
  }'
```

## That's It! 🎉

Your backend is now running. You can:

- View API documentation in `docs/API.md`
- Test endpoints with Postman or curl
- Start building your admin dashboard integration

## Common Commands

```bash
# Stop PostgreSQL
docker-compose down

# Start PostgreSQL
docker-compose up -d

# View PostgreSQL logs
docker-compose logs -f postgres

# Restart backend server
# Press Ctrl+C, then run: npm run dev

# Connect to PostgreSQL directly
docker exec -it auto-withdraw-postgres psql -U postgres -d auto_withdraw_db
```

## Troubleshooting

**PostgreSQL not starting?**
```bash
# Check if Docker is running
docker ps

# Restart Docker Desktop (macOS/Windows) or Docker daemon (Linux)
```

**Connection refused?**
```bash
# Check if PostgreSQL is ready
docker-compose logs postgres

# Wait a few more seconds and try again
```

**Port already in use?**
The backend uses port 3001. If you need to change it:
1. Edit `.env` file
2. Change `PORT=3001` to your desired port
3. Restart the server

## Next Steps

- Read the full documentation in `README.md`
- Explore the codebase structure
- Add authentication
- Implement unit tests
- Deploy to production