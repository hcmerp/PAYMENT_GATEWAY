'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { mockAccounts } from '@/lib/mockData';
import { Account } from '@/types';

const Accounts = () => {
    const columns: Column<Account>[] = [
        {
            key: 'account_name',
            header: 'Account Name',
            render: (row) => (
                <span className="font-medium text-gray-900">{row.account_name}</span>
            ),
        },
        {
            key: 'gateway_type',
            header: 'Gateway Type',
            render: (row) => (
                <span className="capitalize font-medium">{row.gateway_type}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
        },
        {
            key: 'api_key',
            header: 'API Key',
            render: (row) => (
                <span className="text-xs text-gray-500 font-mono">
                    {row.api_key ? '••••••••••••' : 'N/A'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (row) => new Date(row.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: () => (
                <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Disable
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    + Add Account
                </button>
            </div>

            <Card className="p-6">
                <Table columns={columns} data={mockAccounts} />
            </Card>
        </div>
    );
};

export default Accounts;