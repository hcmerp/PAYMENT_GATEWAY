// Database: PostgreSQL chosen for ACID compliance and strong transaction support
// Critical for financial systems requiring data integrity and consistency

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'UNKNOWN';
export type TransactionType = 'withdraw';
export type GatewayType = 'maxpay' | 'corepay';

export interface Transaction {
    id: string;
    referenceId: string;
    gateway: GatewayType;
    gatewayTxId?: string;
    type: TransactionType;
    amount: number;
    currency: string;
    status: TransactionStatus;
    rawRequest?: string;
    rawResponse?: string;
    callbackPayload?: string;
    errorCode?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WithdrawRequest {
    referenceId: string;
    amount: number;
    currency: string;
    gateway: GatewayType;
}

export interface GatewayResponse {
    success: boolean;
    gatewayTxId?: string;
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: any;
}

export interface WebhookCallback {
    gatewayTxId: string;
    status: string;
    signature?: string;
    amount?: number;
    currency?: string;
    [key: string]: any;
}

export interface PaymentGateway {
    processWithdrawal(transaction: Transaction): Promise<GatewayResponse>;
    verifySignature(data: any, signature: string): boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}