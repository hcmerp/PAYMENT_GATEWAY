import { Transaction, GatewayResponse } from '../types';

/**
 * Generic Payment Gateway Interface
 * All payment gateway adapters must implement this interface
 */
export interface PaymentGateway {
    /**
     * Process a withdrawal transaction
     * @param transaction - The transaction to process
     * @returns GatewayResponse with success status and transaction details
     */
    processWithdrawal(transaction: Transaction): Promise<GatewayResponse>;

    /**
     * Verify webhook signature from gateway
     * @param data - The callback data
     * @param signature - The signature to verify
     * @returns true if signature is valid, false otherwise
     */
    verifySignature(data: any, signature: string): boolean;

    /**
     * Check transaction status by reference or transaction ID
     * @param reference - Optional reference ID to check
     * @param transactionUniqueId - Optional transaction unique ID to check
     * @returns CheckResponse with transaction details
     */
    checkTransaction(reference?: string, transactionUniqueId?: string): Promise<CheckResponse>;
}

export interface CheckResponse {
    success: boolean;
    transactions?: CheckedTransaction[];
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: string;
}

export interface CheckedTransaction {
    reference: string;
    transactionUniqueId: string;
    transactionType: string;
    status: string;
    code: number;
    message: string;
    token?: string;
    timestamp?: number;
    authcode?: string | null;
}
