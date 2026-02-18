'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api, BackendTransaction } from '@/lib/api';
import { Transaction } from '@/types';

const TransactionDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [showJson, setShowJson] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getTransactionById(params.id as string);

            if (response.success && response.data) {
                // Map backend transaction to frontend format
                const tx: Transaction = {
                    id: response.data.id,
                    transaction_id: response.data.referenceId,
                    gateway: response.data.gateway as any,
                    type: response.data.type as any,
                    amount: response.data.amount,
                    currency: response.data.currency,
                    status: response.data.status.toLowerCase() as any,
                    created_at: response.data.createdAt,
                    updated_at: response.data.updatedAt,
                    callback_payload: response.data.callbackPayload,
                    status_history: response.data.rawResponse
                        ? [{
                            status: response.data.status.toLowerCase() as any,
                            timestamp: response.data.updatedAt,
                            notes: response.data.errorMessage || 'Transaction updated'
                        }]
                        : undefined,
                };
                setTransaction(tx);
            } else {
                setError(response.error || 'Failed to fetch transaction');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchTransaction();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction Details</h1>
                <Card className="p-6">
                    <p className="text-gray-600 text-center">Loading transaction...</p>
                </Card>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction Not Found</h1>
                <Card className="p-6">
                    <p className="text-gray-600">{error || `Transaction with ID ${params.id} not found.`}</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                    >
                        ← Back to Transactions
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Transaction ID</span>
                            <span className="text-sm font-medium text-gray-900">{transaction.transaction_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Gateway</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">{transaction.gateway}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type</span>
                            <span className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Amount</span>
                            <span className="text-sm font-medium text-gray-900">
                                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <Badge variant={transaction.status}>{transaction.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Created At</span>
                            <span className="text-sm text-gray-900">{new Date(transaction.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Updated At</span>
                            <span className="text-sm text-gray-900">{new Date(transaction.updated_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                disabled
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                            >
                                Retry
                            </button>
                            <button
                                disabled
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                            >
                                Mark as Resolved
                            </button>
                            <button
                                disabled
                                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
                            >
                                Open Case
                            </button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
                    <div className="space-y-4">
                        {transaction.status_history && transaction.status_history.length > 0 ? (
                            transaction.status_history.map((history, index) => (
                                <div key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0">
                                    <div className="absolute left-0 top-0 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant={history.status}>{history.status}</Badge>
                                        <span className="text-xs text-gray-500">
                                            {new Date(history.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    {history.notes && (
                                        <p className="text-sm text-gray-600">{history.notes}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No status history available</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Raw Callback Payload</h2>
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                        {showJson ? 'Hide JSON' : 'Show JSON'}
                    </button>
                </div>
                {showJson && transaction.callback_payload ? (
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(transaction.callback_payload, null, 2)}
                    </pre>
                ) : (
                    <p className="text-sm text-gray-500">Click "Show JSON" to view the raw callback payload</p>
                )}
            </Card>
        </div>
    );
};

export default TransactionDetail;
