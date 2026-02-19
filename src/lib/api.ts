// Use ngrok URL for public access during testing
// Change back to 'http://localhost:3001' for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unlackeyed-spireless-deangelo.ngrok-free.dev';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    count?: number;
    error?: string;
}

export interface BackendTransaction {
    id: string;
    referenceId: string;
    gateway: string;
    gatewayTxId: string | null;
    type: string;
    amount: number;
    currency: string;
    status: string;
    rawRequest: string | null;
    rawResponse: string | null;
    callbackPayload: any;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawalRequest {
    referenceId: string;
    amount: number;
    currency: string;
    gateway: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            // Get response text first to debug non-JSON responses
            const responseText = await response.text();

            // Log the response for debugging
            if (!response.ok || !responseText.startsWith('{')) {
                console.error('API Response:', {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    body: responseText.substring(0, 500), // First 500 chars
                });
            }

            // Parse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON:', responseText.substring(0, 500));
                return {
                    success: false,
                    error: `Invalid JSON response: ${responseText.substring(0, 200)}`,
                };
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || `HTTP error! status: ${response.status}`,
                };
            }

            return data as ApiResponse<T>;
        } catch (error) {
            console.error('API request error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    // Health check
    async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; service: string }>> {
        return this.request('/health');
    }

    // Transactions
    async getAllTransactions(limit?: number, offset?: number): Promise<ApiResponse<BackendTransaction[]>> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const query = params.toString();
        return this.request<BackendTransaction[]>(`/transactions${query ? `?${query}` : ''}`);
    }

    async getTransactionById(id: string): Promise<ApiResponse<BackendTransaction>> {
        return this.request<BackendTransaction>(`/transactions/${id}`);
    }

    async getTransactionByReferenceId(referenceId: string): Promise<ApiResponse<BackendTransaction>> {
        return this.request<BackendTransaction>(`/transactions/reference/${referenceId}`);
    }

    // Withdrawals
    async createWithdrawal(data: WithdrawalRequest): Promise<ApiResponse<BackendTransaction>> {
        return this.request<BackendTransaction>('/withdraw', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Webhooks (for testing)
    async triggerMaxpayWebhook(data: any): Promise<ApiResponse<any>> {
        return this.request('/webhook/maxpay', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient();