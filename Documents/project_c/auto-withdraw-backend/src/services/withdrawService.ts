import { createTransaction, updateTransactionStatus, findTransactionByReferenceId, findTransactionByGatewayTxId } from '../database/transactionRepository';
import { GatewayFactory } from '../gateways/gatewayFactory';
import { WithdrawRequest, Transaction, TransactionStatus } from '../types';

/**
 * Withdraw Service
 * Handles the complete withdrawal transaction lifecycle
 */
export class WithdrawService {
    /**
     * Process a new withdrawal request
     * 1. Create transaction with PENDING status
     * 2. Update to PROCESSING
     * 3. Call gateway adapter
     * 4. Update status based on gateway response
     */
    async processWithdraw(request: WithdrawRequest): Promise<Transaction> {
        console.log(`[WithdrawService] Processing withdrawal request: ${request.referenceId}`);

        // Check for duplicate reference ID
        const existingTransaction = await findTransactionByReferenceId(request.referenceId);
        if (existingTransaction) {
            throw new Error(`Transaction with reference ID ${request.referenceId} already exists`);
        }

        // Create transaction with PENDING status
        const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
            referenceId: request.referenceId,
            gateway: request.gateway,
            type: 'withdraw',
            amount: request.amount,
            currency: request.currency,
            status: 'PENDING',
        };

        const createdTransaction = await createTransaction(transaction);
        console.log(`[WithdrawService] Created transaction: ${createdTransaction.id} with status PENDING`);

        // Update to PROCESSING
        const processingTransaction = await updateTransactionStatus(createdTransaction.id, 'PROCESSING');
        if (!processingTransaction) {
            throw new Error('Failed to update transaction status to PROCESSING');
        }
        console.log(`[WithdrawService] Updated transaction to PROCESSING`);

        // Get gateway adapter
        const gateway = GatewayFactory.getGateway(request.gateway);

        // Process withdrawal via gateway
        const gatewayResponse = await gateway.processWithdrawal(processingTransaction);

        // Update transaction based on gateway response
        let newStatus: TransactionStatus;
        let additionalData: Partial<Transaction> = {
            rawResponse: gatewayResponse.rawResponse,
        };

        if (gatewayResponse.success) {
            newStatus = 'SUCCESS';
            additionalData.gatewayTxId = gatewayResponse.gatewayTxId;
            console.log(`[WithdrawService] Withdrawal SUCCESS. Gateway TX ID: ${gatewayResponse.gatewayTxId}`);
        } else {
            newStatus = 'FAILED';
            additionalData.errorCode = gatewayResponse.errorCode;
            additionalData.errorMessage = gatewayResponse.errorMessage;
            console.log(`[WithdrawService] Withdrawal FAILED. Error: ${gatewayResponse.errorMessage}`);
        }

        const finalTransaction = await updateTransactionStatus(
            processingTransaction.id,
            newStatus,
            additionalData
        );

        if (!finalTransaction) {
            throw new Error('Failed to update transaction final status');
        }

        console.log(`[WithdrawService] Transaction completed with status: ${newStatus}`);
        return finalTransaction;
    }

    /**
     * Handle webhook callback from gateway
     * Ensures idempotency - duplicate callbacks do not corrupt data
     * 
     * @param identifier - Can be either reference ID (from Maxpay) or gateway transaction ID
     * @param status - Status from the webhook
     * @param payload - Full webhook payload
     */
    async handleWebhook(identifier: string, status: string, payload: any): Promise<Transaction | null> {
        console.log(`[WithdrawService] Handling webhook for identifier: ${identifier}, status: ${status}`);

        // Try to find transaction by reference ID first (used by Maxpay callbacks)
        let transaction = await findTransactionByReferenceId(identifier);

        // If not found, try by gateway transaction ID (for other gateways)
        if (!transaction) {
            transaction = await findTransactionByGatewayTxId(identifier);
        }

        if (!transaction) {
            console.error(`[WithdrawService] Transaction not found for identifier: ${identifier}`);
            return null;
        }

        // Idempotency check: If transaction already has callback payload, skip
        if (transaction.callbackPayload) {
            console.log(`[WithdrawService] Transaction ${transaction.id} already processed callback. Skipping (idempotent)`);
            return transaction;
        }

        // Normalize status from gateway to our system
        const newStatus = this.normalizeGatewayStatus(status);
        console.log(`[WithdrawService] Normalized status: ${status} -> ${newStatus}`);

        // Prepare additional data from webhook payload
        const additionalData: Partial<Transaction> = {
            callbackPayload: JSON.stringify(payload),
        };

        // If payload contains uniqueTransactionId, update gatewayTxId
        if (payload.uniqueTransactionId && !transaction.gatewayTxId) {
            additionalData.gatewayTxId = payload.uniqueTransactionId;
            console.log(`[WithdrawService] Updated gatewayTxId to: ${payload.uniqueTransactionId}`);
        }

        // If payload contains error code/message, update them
        if (payload.code !== undefined && payload.code !== 0) {
            additionalData.errorCode = payload.code.toString();
            additionalData.errorMessage = payload.message || 'Unknown error';
            console.log(`[WithdrawService] Error code: ${payload.code}, message: ${payload.message}`);
        }

        // Update transaction with callback data
        const updatedTransaction = await updateTransactionStatus(transaction.id, newStatus, additionalData);

        if (!updatedTransaction) {
            console.error(`[WithdrawService] Failed to update transaction ${transaction.id}`);
            return null;
        }

        console.log(`[WithdrawService] Webhook processed successfully for transaction: ${updatedTransaction.id}`);
        return updatedTransaction;
    }

    /**
     * Normalize gateway status to our system status
     */
    private normalizeGatewayStatus(gatewayStatus: string): TransactionStatus {
        const status = gatewayStatus.toLowerCase();

        if (status === 'success' || status === 'completed' || status === 'approved') {
            return 'SUCCESS';
        } else if (status === 'failed' || status === 'rejected' || status === 'declined') {
            return 'FAILED';
        } else if (status === 'pending' || status === 'processing') {
            return 'PROCESSING';
        } else {
            return 'UNKNOWN';
        }
    }
}