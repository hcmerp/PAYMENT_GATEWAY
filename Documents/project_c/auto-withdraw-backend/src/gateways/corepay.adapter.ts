import { PaymentGateway, CheckResponse } from './PaymentGateway';
import { Transaction, GatewayResponse } from '../types';

/**
 * Corepay Gateway Adapter (Skeleton)
 * Prepared for future implementation
 * 
 * TODO: Implement when Corepay integration is required
 * - Build payout request payload
 * - Generate signature using API secret
 * - Send payout request to Corepay API
 * - Normalize response format
 */
export class CorepayAdapter implements PaymentGateway {
    async processWithdrawal(transaction: Transaction): Promise<GatewayResponse> {
        console.log('[Corepay] Adapter not yet implemented');
        throw new Error('Corepay adapter is not yet implemented');
    }

    verifySignature(data: any, signature: string): boolean {
        console.log('[Corepay] Signature verification not yet implemented');
        return false;
    }

    async checkTransaction(reference?: string, transactionUniqueId?: string): Promise<CheckResponse> {
        console.log('[Corepay] Transaction check not yet implemented');
        return {
            success: false,
            errorCode: 'NOT_IMPLEMENTED',
            errorMessage: 'Corepay transaction check is not yet implemented',
        };
    }
}
