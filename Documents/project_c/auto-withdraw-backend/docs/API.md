# Auto Withdraw Backend API Documentation

## Overview

This document describes the API endpoints for the Auto Withdraw Backend system.

**Base URL:** `http://localhost:3000`

---

## Authentication

Currently, the API does not require authentication. In production, implement API key or JWT-based authentication.

---

## Endpoints

### 1. Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-30T00:00:00.000Z",
  "service": "Auto Withdraw Backend"
}
```

---

### 2. Process Withdrawal

Process a new withdrawal request through the payment gateway.

**Endpoint:** `POST /withdraw`

**Request Body:**
```json
{
  "referenceId": "ORDER-12345",
  "amount": 100.50,
  "currency": "USD",
  "gateway": "maxpay"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| referenceId | string | Yes | Unique identifier from your system (must be unique) |
| amount | number | Yes | Withdrawal amount (must be positive) |
| currency | string | Yes | Currency code (e.g., USD, EUR, THB) |
| gateway | string | Yes | Payment gateway: `maxpay` or `corepay` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "referenceId": "ORDER-12345",
    "gateway": "maxpay",
    "amount": 100.50,
    "currency": "USD",
    "status": "SUCCESS",
    "gatewayTxId": "MP-789456123",
    "createdAt": "2024-01-30T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: referenceId, amount, currency, gateway"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Transaction with reference ID ORDER-12345 already exists"
}
```

**Transaction Status Values:**

| Status | Description |
|--------|-------------|
| PENDING | Transaction created, waiting to be processed |
| PROCESSING | Transaction sent to gateway |
| SUCCESS | Withdrawal completed successfully |
| FAILED | Withdrawal failed (check errorCode and errorMessage) |
| UNKNOWN | Status unknown from gateway |

---

### 3. Maxpay Webhook

Handle webhook callback from Maxpay gateway.

**Endpoint:** `POST /webhook/maxpay`

**Request Body:**
```json
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "signature": "a1b2c3d4e5f6...",
  "amount": 100.50,
  "currency": "USD"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| transaction_id | string | Yes | Our internal transaction UUID |
| status | string | Yes | Gateway status (success, failed, pending) |
| signature | string | No | Signature for verification |
| amount | number | No | Transaction amount |
| currency | string | No | Currency code |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "SUCCESS"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: transaction_id, status"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid signature"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Transaction not found"
}
```

---

## Idempotency

The API ensures idempotency:

1. **Duplicate Withdrawal Requests:** If you send a withdrawal request with the same `referenceId`, the API returns a 409 error with the message "Transaction with reference ID already exists".

2. **Duplicate Webhook Callbacks:** If the gateway sends multiple webhook callbacks for the same transaction, the API will only process the first one and ignore subsequent duplicates.

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | - | Bad request (missing or invalid fields) |
| 401 | - | Invalid signature (webhook) |
| 404 | - | Transaction not found (webhook) |
| 409 | - | Duplicate reference ID |
| 500 | - | Internal server error |

---

## Example cURL Commands

### Process Withdrawal

```bash
curl -X POST http://localhost:3000/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "referenceId": "ORDER-12345",
    "amount": 100.50,
    "currency": "USD",
    "gateway": "maxpay"
  }'
```

### Health Check

```bash
curl http://localhost:3000/health
```

### Test Webhook (Maxpay)

```bash
curl -X POST http://localhost:3000/webhook/maxpay \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "success",
    "signature": "test_signature",
    "amount": 100.50,
    "currency": "USD"
  }'
```

---

## Postman Collection

You can import the following JSON into Postman:

```json
{
  "info": {
    "name": "Auto Withdraw Backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Process Withdrawal",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"referenceId\": \"ORDER-12345\",\n  \"amount\": 100.50,\n  \"currency\": \"USD\",\n  \"gateway\": \"maxpay\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/withdraw",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["withdraw"]
        }
      }
    },
    {
      "name": "Maxpay Webhook",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"transaction_id\": \"your-transaction-id\",\n  \"status\": \"success\",\n  \"signature\": \"test_signature\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/webhook/maxpay",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["webhook", "maxpay"]
        }
      }
    }
  ]
}