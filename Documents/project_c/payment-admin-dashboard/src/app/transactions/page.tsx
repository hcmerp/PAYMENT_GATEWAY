'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { api, BackendTransaction } from '@/lib/api';
import { Transaction } from '@/types';

const Transactions = () => {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getAllTransactions();

            if (response.success && response.data) {
                // Map backend transactions to frontend format
                const mapped: Transaction[] = response.data.map((tx: BackendTransaction) => ({
                    id: tx.id,
                    transaction_id: tx.referenceId,
                    gateway: tx.gateway as any,
                    type: tx.type as any,
                    amount: tx.amount,
                    currency: tx.currency,
                    status: tx.status.toLowerCase() as any,
                    created_at: tx.createdAt,
                    updated_at: tx.updatedAt,
                    callback_payload: tx.callbackPayload,
                }));
                setTransactions(mapped);
            } else {
                setError(response.error || 'Failed to fetch transactions');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const columns: Column<Transaction>[] = [
        {
            key: 'transaction_id',
            header: 'Transaction ID',
        },
        {
            key: 'gateway',
            header: 'Gateway',
            render: (row) => (
                <span className="capitalize font-medium">{row.gateway}</span>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (row) => (
                <span className="capitalize">{row.type}</span>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (row) => `$${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (row) => new Date(row.created_at).toLocaleString(),
        },
    ];

    const handleRowClick = (row: Transaction) => {
        router.push(`/transactions/${row.id}`);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                <button
                    onClick={fetchTransactions}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <Card className="p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : (
                    <Table
                        columns={columns}
                        data={transactions}
                        onRowClick={handleRowClick}
                    />
                )}

                {!loading && transactions.length === 0 && !error && (
                    <div className="text-center py-8 text-gray-500">No transactions found</div>
                )}
            </Card>
        </div>
    );
};

export default Transactions;
