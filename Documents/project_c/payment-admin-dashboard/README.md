# Payment Gateway Admin Dashboard

A clean, production-ready admin dashboard template for payment gateway management systems.

## Features

- Dashboard overview with transaction statistics
- Transaction management with detail views
- Case/error management
- Gateway account management
- Settings configuration (webhooks, security, notifications)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React 19

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard overview
│   ├── accounts/           # Account management page
│   ├── cases/              # Case management page
│   ├── settings/           # Settings page
│   └── transactions/       # Transactions list & detail pages
│       ├── page.tsx
│       └── [id]/page.tsx
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx    # Navigation sidebar
│   └── ui/
│       ├── Badge.tsx        # Status badge component
│       ├── Card.tsx         # Card container
│       ├── Modal.tsx        # Modal dialog
│       └── Table.tsx        # Generic table component
├── lib/
│   └── mockData.ts         # Mock data for all pages
└── types/
    └── index.ts            # TypeScript type definitions
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Extending the Template

### 1. Replace Mock Data with Real API

Replace `src/lib/mockData.ts` with API calls:

```typescript
// Example: Replace mock data with API fetch
export async function getTransactions() {
  const response = await fetch('/api/transactions');
  return response.json();
}
```

### 2. Add Authentication

Add authentication middleware and protect routes:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### 3. Connect to Database

Use Prisma, Drizzle, or any ORM:

```typescript
// Example with Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTransactions = async () => {
  return await prisma.transaction.findMany();
};
```

### 4. Add Real Form Actions

Replace disabled buttons with actual actions:

```typescript
// Example: Add retry functionality
const handleRetry = async (transactionId: string) => {
  await fetch(`/api/transactions/${transactionId}/retry`, {
    method: 'POST',
  });
};
```

### 5. Add Notification System

Integrate real-time notifications:

```typescript
// Example with WebSockets
import { useEffect, useState } from 'react';

useEffect(() => {
  const ws = new WebSocket('ws://localhost:3001');
  ws.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    // Handle notification
  };
  return () => ws.close();
}, []);
```

## Components Reference

### Badge
Display status with color coding:
```tsx
<Badge variant="success">Success</Badge>
```

### Table
Generic table with custom columns:
```tsx
<Table
  columns={columns}
  data={data}
  onRowClick={handleClick}
/>
```

### Card
Content container:
```tsx
<Card className="p-6">
  {/* Content */}
</Card>
```

### Modal
Dialog popup:
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Title">
  {/* Content */}
</Modal>
```

## Type Definitions

All types are defined in `src/types/index.ts`:
- `Transaction`: Transaction data structure
- `Case`: Error/issue case data
- `Account`: Gateway account data
- `DashboardStats`: Statistics for overview

## Notes

- This is a UI template only
- No real payment processing logic
- No real credentials stored
- All actions are UI placeholders
- Mock data provided for demonstration

## License

MIT