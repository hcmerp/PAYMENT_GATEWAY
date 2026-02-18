'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Table, { Column } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { mockCases } from '@/lib/mockData';
import { Case } from '@/types';

const columns: Column<Case>[] = [
    {
        key: 'case_id',
        header: 'Case ID',
    },
    {
        key: 'transaction_id',
        header: 'Transaction ID',
    },
    {
        key: 'status',
        header: 'Status',
        render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
    },
    {
        key: 'error_message',
        header: 'Error Message',
        render: (row) => (
            <span className="max-w-xs truncate">{row.error_message}</span>
        ),
    },
    {
        key: 'assigned_to',
        header: 'Assigned To',
        render: (row) => row.assigned_to || 'Unassigned',
    },
    {
        key: 'created_at',
        header: 'Created At',
        render: (row) => new Date(row.created_at).toLocaleString(),
    },
];

const Cases = () => {

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
            </div>

            <Card className="p-6">
                <Table columns={columns} data={mockCases} />
            </Card>
        </div>
    );
};

export default Cases;