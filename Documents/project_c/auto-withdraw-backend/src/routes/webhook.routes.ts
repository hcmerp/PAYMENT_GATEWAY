import { Router, Request, Response } from 'express';
import { WithdrawService } from '../services/withdrawService';
import { MaxpayAdapter } from '../gateways/maxpay.adapter';
import { GatewayFactory } from '../gateways/gatewayFactory';

const router = Router();
const withdrawService = new WithdrawService();

/**
 * Maxpay Callback 2.0 Interface
 * Reference: https://docs.maxpay.com/developers/callback-2.0
 */
interface MaxpayCallback20 {
    uniqueTransactionId: string;
    reference: string;
    uniqueUserId?: string;
    totalAmount: number;
    currency: string;
    transactionType: string;
    status: string;
    message: string;
    code: number;
    productList?: Array<{
        productId: string;
        name: string;
        amount: number;
        currency: string;
    }>;
    testMode?: string;
    signature?: string;
    [key: string]: any;
}

/**
 * POST /webhook/maxpay
 * Handle Maxpay webhook callback (Callback 2.0 format)
 * 
 * Request Body (Callback 2.0):
 * {
 *   "uniqueTransactionId": "string",
 *   "reference": "string",
 *   "uniqueUserId": "string",
 *   "totalAmount": number,
 *   "currency": "string",
 *   "transactionType": "SALE|WITHDRAWAL|REFUND",
 *   "status": "success|failed|pending",
 *   "message": "string",
 *   "code": 0,
 *   "productList": [...],
 *   "testMode": "0|1",
 *   "signature": "string"
 * }
 * 
 * Response codes:
 * - 200: Callback received and processed
 * - 400: Invalid request
 * - 401: Invalid signature
 * - 404: Transaction not found
 * - 500: Internal server error
 */
router.post('/webhook/maxpay', async (req: Request, res: Response) => {
    try {
        const payload = req.body as MaxpayCallback20;

        console.log('[Webhook] Received Maxpay Callback 2.0:', JSON.stringify(payload, null, 2));

        // Validate required fields
        if (!payload.uniqueTransactionId || !payload.reference || !payload.status) {
            console.error('[Webhook] Missing required fields');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: uniqueTransactionId, reference, status',
            });
        }

        // Verify signature if provided
        if (payload.signature) {
            const maxpayAdapter = GatewayFactory.getGateway('maxpay') as MaxpayAdapter;
            const isSignatureValid = maxpayAdapter.verifySignature(payload, payload.signature);

            if (!isSignatureValid) {
                console.error('[Webhook] Invalid signature received');
                return res.status(401).json({
                    success: false,
                    error: 'Invalid signature',
                });
            }
        }

        // Determine transaction status based on code and status
        // Code 0 = success, any other code = failed
        let status = payload.status.toLowerCase();
        if (payload.code !== 0) {
            status = 'failed';
        } else if (status === 'success') {
            status = 'success';
        } else if (status === 'pending' || status === 'processing') {
            status = 'processing';
        } else {
            status = 'failed';
        }

        console.log(`[Webhook] Processing webhook for reference: ${payload.reference}, status: ${status}, code: ${payload.code}`);

        // Handle webhook with idempotency
        // Use reference ID to find the original transaction
        const transaction = await withdrawService.handleWebhook(
            payload.reference,
            status,
            payload
        );

        if (!transaction) {
            console.error(`[Webhook] Transaction not found for reference: ${payload.reference}`);
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }

        console.log(`[Webhook] Transaction ${transaction.id} updated to status: ${status}`);

        // Return 200 to acknowledge receipt of callback
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            data: {
                id: transaction.id,
                status: transaction.status,
                referenceId: transaction.referenceId,
            },
        });
    } catch (error: any) {
        console.error('[Webhook] Error processing callback:', error);

        // Return 200 even on error to prevent gateway retries
        // Per Maxpay documentation: return 200 to acknowledge receipt
        res.status(200).json({
            success: false,
            error: 'Internal server error - callback received but not processed',
        });
    }
});

export default router;
