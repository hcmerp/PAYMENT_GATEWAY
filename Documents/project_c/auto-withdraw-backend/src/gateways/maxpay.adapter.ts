import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { PaymentGateway, CheckResponse, CheckedTransaction } from './PaymentGateway';
import { Transaction, GatewayResponse } from '../types';

/**
 * Maxpay Gateway Adapter
 * Implements PaymentGateway interface for Maxpay integration
 */
export class MaxpayAdapter implements PaymentGateway {
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly merchantId: string;
    private readonly baseUrl: string;

    constructor() {
        this.apiKey = process.env.MAXPAY_API_KEY || '';
        this.apiSecret = process.env.MAXPAY_API_SECRET || '';
        this.merchantId = process.env.MAXPAY_MERCHANT_ID || '';
        this.baseUrl = process.env.MAXPAY_BASE_URL || 'https://api.maxpay.com/v1';

        if (!this.apiKey || !this.apiSecret || !this.merchantId) {
            throw new Error('Maxpay configuration is incomplete. Please check environment variables.');
        }
    }

    /**
     * Process withdrawal via Maxpay API
     */
    async processWithdrawal(transaction: Transaction): Promise<GatewayResponse> {
        try {
            const payload = this.buildPayload(transaction);
            const signature = this.generateSignature(payload);

            const rawRequest = JSON.stringify({ ...payload, signature });
            console.log(`[Maxpay] Processing withdrawal for transaction ${transaction.id}`);

            const response = await axios.post(
                `${this.baseUrl}/payout`,
                { ...payload, signature },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey,
                    },
                    timeout: 30000, // 30 second timeout
                }
            );

            const rawResponse = JSON.stringify(response.data);

            if (response.data.success && response.data.transaction_id) {
                console.log(`[Maxpay] Withdrawal successful. Gateway TX ID: ${response.data.transaction_id}`);
                return {
                    success: true,
                    gatewayTxId: response.data.transaction_id,
                    rawResponse,
                };
            } else {
                console.error(`[Maxpay] Withdrawal failed:`, response.data);
                return {
                    success: false,
                    errorCode: response.data.error_code || 'GATEWAY_ERROR',
                    errorMessage: response.data.message || 'Gateway error',
                    rawResponse,
                };
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('[Maxpay] Network or API error:', axiosError.message);

            return {
                success: false,
                errorCode: 'NETWORK_ERROR',
                errorMessage: axiosError.message || 'Network error occurred',
                rawResponse: axiosError.response?.data
                    ? JSON.stringify(axiosError.response.data)
                    : undefined,
            };
        }
    }

    /**
     * Verify webhook signature from Maxpay
     */
    verifySignature(data: any, signature: string): boolean {
        try {
            const expectedSignature = this.generateSignature(data);
            const isValid = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

            console.log(`[Maxpay] Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid;
        } catch (error) {
            console.error('[Maxpay] Signature verification error:', error);
            return false;
        }
    }

    /**
     * Check transaction status via Maxpay CHECK API
     * @param reference - Optional reference ID to check
     * @param transactionUniqueId - Optional transaction unique ID to check
     * @returns CheckResponse with transaction details
     */
    async checkTransaction(reference?: string, transactionUniqueId?: string): Promise<CheckResponse> {
        try {
            if (!reference && !transactionUniqueId) {
                return {
                    success: false,
                    errorCode: 'INVALID_REQUEST',
                    errorMessage: 'Either reference or transactionUniqueId must be provided',
                };
            }

            // Build CHECK request payload according to Maxpay documentation
            const payload: any = {
                api_version: 1,
                merchant_account: this.merchantId,
                merchant_password: this.apiSecret,
                transaction_type: 'CHECK',
            };

            if (reference) {
                payload.reference = reference;
            }

            if (transactionUniqueId) {
                payload.transaction_unique_id = transactionUniqueId;
            }

            const rawRequest = JSON.stringify(payload);
            console.log(`[Maxpay] Checking transaction status:`, {
                reference: reference || 'N/A',
                transactionUniqueId: transactionUniqueId || 'N/A',
            });

            const response = await axios.post(
                `${this.baseUrl}/transaction`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.apiKey,
                    },
                    timeout: 30000,
                }
            );

            const rawResponse = JSON.stringify(response.data);

            // Check if response is successful
            if (response.data.status === 'success' && response.data.transactions) {
                const checkedTransactions: CheckedTransaction[] = response.data.transactions.map(
                    (tx: any) => ({
                        reference: tx.reference,
                        transactionUniqueId: tx.transaction_unique_id,
                        transactionType: tx.transaction_type,
                        status: tx.status,
                        code: tx.code,
                        message: tx.message,
                        token: tx.token,
                        timestamp: tx.timestamp,
                        authcode: tx.authcode,
                    })
                );

                console.log(`[Maxpay] Transaction check successful. Found ${checkedTransactions.length} transaction(s)`);
                return {
                    success: true,
                    transactions: checkedTransactions,
                    rawResponse,
                };
            } else {
                console.error(`[Maxpay] Transaction check failed:`, response.data);
                return {
                    success: false,
                    errorCode: response.data.code?.toString() || 'CHECK_FAILED',
                    errorMessage: response.data.message || 'Transaction check failed',
                    rawResponse,
                };
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('[Maxpay] Check transaction error:', axiosError.message);

            return {
                success: false,
                errorCode: 'NETWORK_ERROR',
                errorMessage: axiosError.message || 'Network error occurred',
                rawResponse: axiosError.response?.data
                    ? JSON.stringify(axiosError.response.data)
                    : undefined,
            };
        }
    }

    /**
     * Build payload for Maxpay payout request
     */
    private buildPayload(transaction: Transaction): any {
        return {
            merchant_id: this.merchantId,
            transaction_id: transaction.id,
            amount: transaction.amount.toFixed(2),
            currency: transaction.currency,
            reference_id: transaction.referenceId,
            timestamp: Math.floor(Date.now() / 1000),
        };
    }

    /**
     * Generate signature for request verification
     * Format: SHA256(apiSecret + sortedPayload + apiSecret)
     */
    private generateSignature(payload: any): string {
        // Sort payload keys alphabetically
        const sortedPayload = Object.keys(payload)
            .sort()
            .reduce((result: any, key) => {
                result[key] = payload[key];
                return result;
            }, {});

        const payloadString = JSON.stringify(sortedPayload);
        const signatureString = this.apiSecret + payloadString + this.apiSecret;

        return crypto
            .createHash('sha256')
            .update(signatureString)
            .digest('hex');
    }
}