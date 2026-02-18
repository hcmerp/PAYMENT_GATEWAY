import { Router, Request, Response } from 'express';
import { findTransactionById, findTransactionByReferenceId, findAllTransactions, updateTransactionStatus } from '../database/transactionRepository';
import { GatewayFactory } from '../gateways/gatewayFactory';
import { TransactionStatus } from '../types';

const router = Router();

/**
 * GET /transactions
 * Get all transactions
 */
router.get('/transactions', async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

        const transactions = await findAllTransactions(limit, offset);

        res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length,
        });
    } catch (error: any) {
        console.error('[TransactionRoute] Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /transactions/:id
 * Get transaction by ID
 */
router.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction ID',
            });
        }

        const transaction = await findTransactionById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }

        res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error: any) {
        console.error('[TransactionRoute] Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * GET /transactions/reference/:referenceId
 * Get transaction by reference ID
 */
router.get('/transactions/reference/:referenceId', async (req: Request, res: Response) => {
    try {
        const { referenceId } = req.params;

        if (typeof referenceId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid reference ID',
            });
        }

        const transaction = await findTransactionByReferenceId(referenceId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }

        res.status(200).json({
            success: true,
            data: transaction,
        });
    } catch (error: any) {
        console.error('[TransactionRoute] Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * POST /transactions/check
 * Check transaction status with payment gateway
 * 
 * Request Body:
 * {
 *   "referenceId": "ORDER-12345",  // Optional: Reference ID
 *   "transactionUniqueId": "abc123",  // Optional: Gateway transaction ID
 *   "gateway": "maxpay"  // Required: Payment gateway
 * }
 * 
 * Note: Either referenceId or transactionUniqueId must be provided
 */
router.post('/transactions/check', async (req: Request, res: Response) => {
    try {
        const { referenceId, transactionUniqueId, gateway } = req.body;

        // Validate required fields
        if (!gateway) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: gateway',
            });
        }

        if (!referenceId && !transactionUniqueId) {
            return res.status(400).json({
                success: false,
                error: 'Either referenceId or transactionUniqueId must be provided',
            });
        }

        console.log(`[TransactionRoute] Checking transaction status via ${gateway}:`, {
            referenceId: referenceId || 'N/A',
            transactionUniqueId: transactionUniqueId || 'N/A',
        });

        // Get gateway adapter
        const paymentGateway = GatewayFactory.getGateway(gateway);

        // Check transaction status with gateway
        const checkResponse = await paymentGateway.checkTransaction(referenceId, transactionUniqueId);

        // If check was successful, update our database if we have a matching transaction
        if (checkResponse.success && checkResponse.transactions && checkResponse.transactions.length > 0) {
            const checkedTx = checkResponse.transactions[0];

            // Try to find the transaction in our database
            let dbTransaction;
            if (referenceId) {
                dbTransaction = await findTransactionByReferenceId(referenceId);
            } else if (transactionUniqueId) {
                // Note: This would require a method to find by gateway transaction ID
                // For now, we'll skip updating if we only have transactionUniqueId
                console.log('[TransactionRoute] Transaction check successful, but cannot update DB without referenceId');
            }

            // If we found the transaction, update its status based on gateway response
            if (dbTransaction) {
                const newStatus = normalizeGatewayStatus(checkedTx.status);

                // Only update if status has changed
                if (dbTransaction.status !== newStatus) {
                    console.log(`[TransactionRoute] Updating transaction status: ${dbTransaction.status} -> ${newStatus}`);

                    await updateTransactionStatus(dbTransaction.id, newStatus, {
                        errorCode: checkedTx.code !== 0 ? checkedTx.code.toString() : undefined,
                        errorMessage: checkedTx.code !== 0 ? checkedTx.message : undefined,
                    });
                }
            }
        }

        res.status(200).json({
            success: checkResponse.success,
            data: checkResponse.transactions,
            errorCode: checkResponse.errorCode,
            errorMessage: checkResponse.errorMessage,
        });
    } catch (error: any) {
        console.error('[TransactionRoute] Error checking transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
});

/**
 * Normalize gateway status to our system status
 */
function normalizeGatewayStatus(gatewayStatus: string): TransactionStatus {
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

export default router;
