export type TransactionStatus = 'success' | 'failed' | 'pending' | 'unknown';
export type TransactionType = 'deposit' | 'withdraw';
export type GatewayType = 'maxpay' | 'corepay';
export type CaseStatus = 'open' | 'investigating' | 'resolved';

export interface Transaction {
    id: string;
    transaction_id: string;
    gateway: GatewayType;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    created_at: string;
    updated_at: string;
    callback_payload?: Record<string, any>;
    status_history?: StatusHistory[];
}

export interface StatusHistory {
    status: TransactionStatus;
    timestamp: string;
    notes?: string;
}

export interface Case {
    id: string;
    case_id: string;
    transaction_id: string;
    status: CaseStatus;
    error_message: string;
    assigned_to?: string;
    internal_notes: string;
    created_at: string;
    updated_at: string;
}

export interface Account {
    id: string;
    account_name: string;
    gateway_type: GatewayType;
    status: 'active' | 'disabled';
    api_key?: string;
    secret_key?: string;
    created_at: string;
}

export interface DashboardStats {
    total_transactions: number;
    success_count: number;
    failed_count: number;
    pending_count: number;
    total_amount_in: number;
    total_amount_out: number;
}