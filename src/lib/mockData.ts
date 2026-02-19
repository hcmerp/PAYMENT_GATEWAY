import { Transaction, Case, Account, DashboardStats } from '@/types';

export const mockTransactions: Transaction[] = [
    {
        id: '1',
        transaction_id: 'TXN20250130001',
        gateway: 'maxpay',
        type: 'deposit',
        amount: 1000.00,
        currency: 'USD',
        status: 'success',
        created_at: '2025-01-30T10:30:00Z',
        updated_at: '2025-01-30T10:30:15Z',
        callback_payload: {
            transaction_id: 'TXN20250130001',
            status: 'completed',
            amount: 1000.00,
            signature: 'abc123...'
        },
        status_history: [
            { status: 'pending', timestamp: '2025-01-30T10:30:00Z', notes: 'Transaction initiated' },
            { status: 'success', timestamp: '2025-01-30T10:30:15Z', notes: 'Payment completed' }
        ]
    },
    {
        id: '2',
        transaction_id: 'TXN20250130002',
        gateway: 'corepay',
        type: 'withdraw',
        amount: 500.00,
        currency: 'USD',
        status: 'failed',
        created_at: '2025-01-30T11:00:00Z',
        updated_at: '2025-01-30T11:00:30Z',
        callback_payload: {
            transaction_id: 'TXN20250130002',
            status: 'failed',
            error_code: 'INSUFFICIENT_FUNDS'
        },
        status_history: [
            { status: 'pending', timestamp: '2025-01-30T11:00:00Z', notes: 'Withdrawal initiated' },
            { status: 'failed', timestamp: '2025-01-30T11:00:30Z', notes: 'Insufficient funds' }
        ]
    },
    {
        id: '3',
        transaction_id: 'TXN20250130003',
        gateway: 'maxpay',
        type: 'deposit',
        amount: 2500.00,
        currency: 'USD',
        status: 'pending',
        created_at: '2025-01-30T11:15:00Z',
        updated_at: '2025-01-30T11:15:00Z',
        callback_payload: {
            transaction_id: 'TXN20250130003',
            status: 'processing'
        },
        status_history: [
            { status: 'pending', timestamp: '2025-01-30T11:15:00Z', notes: 'Transaction processing' }
        ]
    },
    {
        id: '4',
        transaction_id: 'TXN20250130004',
        gateway: 'corepay',
        type: 'deposit',
        amount: 750.00,
        currency: 'USD',
        status: 'success',
        created_at: '2025-01-30T12:00:00Z',
        updated_at: '2025-01-30T12:00:20Z',
        callback_payload: {
            transaction_id: 'TXN20250130004',
            status: 'completed',
            amount: 750.00
        },
        status_history: [
            { status: 'pending', timestamp: '2025-01-30T12:00:00Z' },
            { status: 'success', timestamp: '2025-01-30T12:00:20Z' }
        ]
    },
    {
        id: '5',
        transaction_id: 'TXN20250130005',
        gateway: 'maxpay',
        type: 'withdraw',
        amount: 2000.00,
        currency: 'USD',
        status: 'unknown',
        created_at: '2025-01-30T12:30:00Z',
        updated_at: '2025-01-30T12:30:00Z',
        callback_payload: {
            transaction_id: 'TXN20250130005',
            status: 'unknown'
        },
        status_history: [
            { status: 'unknown', timestamp: '2025-01-30T12:30:00Z', notes: 'Awaiting callback' }
        ]
    }
];

export const mockCases: Case[] = [
    {
        id: '1',
        case_id: 'CASE001',
        transaction_id: 'TXN20250130002',
        status: 'open',
        error_message: 'Insufficient funds in user account',
        assigned_to: 'support_team',
        internal_notes: 'User claims to have sufficient balance',
        created_at: '2025-01-30T11:05:00Z',
        updated_at: '2025-01-30T11:05:00Z'
    },
    {
        id: '2',
        case_id: 'CASE002',
        transaction_id: 'TXN20250130005',
        status: 'investigating',
        error_message: 'No callback received from gateway',
        assigned_to: 'tech_team',
        internal_notes: 'Checking gateway logs',
        created_at: '2025-01-30T12:35:00Z',
        updated_at: '2025-01-30T13:00:00Z'
    },
    {
        id: '3',
        case_id: 'CASE003',
        transaction_id: 'TXN20250129001',
        status: 'resolved',
        error_message: 'Timeout error',
        assigned_to: 'support_team',
        internal_notes: 'Resolved after retry',
        created_at: '2025-01-29T10:00:00Z',
        updated_at: '2025-01-29T14:00:00Z'
    }
];

export const mockAccounts: Account[] = [
    {
        id: '1',
        account_name: 'Maxpay Production',
        gateway_type: 'maxpay',
        status: 'active',
        api_key: 'mp_live_123456',
        secret_key: 'sk_live_abcdef',
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        account_name: 'Corepay Production',
        gateway_type: 'corepay',
        status: 'active',
        api_key: 'cp_prod_789012',
        secret_key: 'sk_prod_ghijkl',
        created_at: '2024-01-15T00:00:00Z'
    },
    {
        id: '3',
        account_name: 'Maxpay Test',
        gateway_type: 'maxpay',
        status: 'disabled',
        api_key: 'mp_test_345678',
        secret_key: 'sk_test_mnopqr',
        created_at: '2024-06-01T00:00:00Z'
    }
];

export const mockDashboardStats: DashboardStats = {
    total_transactions: 5,
    success_count: 2,
    failed_count: 1,
    pending_count: 1,
    total_amount_in: 4250.00,
    total_amount_out: 500.00
};