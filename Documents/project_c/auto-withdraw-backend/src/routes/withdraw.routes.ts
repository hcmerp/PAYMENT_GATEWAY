import { Router, Request, Response } from 'express';
import { WithdrawService } from '../services/withdrawService';
import { WithdrawRequest } from '../types';

const router = Router();
const withdrawService = new WithdrawService();

/**
 * POST /withdraw
 * Process a new withdrawal request
 * 
 * Request Body:
 * {
 *   "referenceId": "string",
 *   "amount": number,
 *   "currency": "string",
 *   "gateway": "maxpay" | "corepay"
 * }
 */
router.post('/withdraw', async (req: Request, res: Response) => {
    try {
        const { referenceId, amount, currency, gateway }: WithdrawRequest = req.body;

        // Validate request format
        if (!referenceId || !amount || !currency || !gateway) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: referenceId, amount, currency, gateway',
            });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number',
            });
        }

        if (!['maxpay', 'corepay'].includes(gateway)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid gateway. Supported gateways: maxpay, corepay',
            });
        }

        // Process withdrawal
        const transaction = await withdrawService.processWithdraw({
            referenceId,
            amount,
            currency,
            gateway,
        });

        res.status(200).json({
            success: true,
            data: {
                id: transaction.id,
                referenceId: transaction.referenceId,
                gateway: transaction.gateway,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                gatewayTxId: transaction.gatewayTxId,
                createdAt: transaction.createdAt,
            },
        });
    } catch (error: any) {
        console.error('[WithdrawRoute] Error processing withdrawal:', error);

        const statusCode = error.message.includes('already exists') ? 409 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});

export default router;