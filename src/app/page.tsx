'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api, BackendTransaction } from '@/lib/api';

interface DashboardStats {
  total_transactions: number;
  success_count: number;
  failed_count: number;
  pending_count: number;
  total_amount_in: number;
  total_amount_out: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_transactions: 0,
    success_count: 0,
    failed_count: 0,
    pending_count: 0,
    total_amount_in: 0,
    total_amount_out: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.getAllTransactions();

      if (response.success && response.data) {
        const transactions = response.data;
        const newStats: DashboardStats = {
          total_transactions: transactions.length,
          success_count: transactions.filter(t => t.status === 'SUCCESS').length,
          failed_count: transactions.filter(t => t.status === 'FAILED').length,
          pending_count: transactions.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length,
          total_amount_in: transactions
            .filter(t => t.type === 'deposit' && t.status === 'SUCCESS')
            .reduce((sum, t) => sum + t.amount, 0),
          total_amount_out: transactions
            .filter(t => t.type === 'withdraw' && t.status === 'SUCCESS')
            .reduce((sum, t) => sum + t.amount, 0),
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Transactions',
      value: stats.total_transactions,
      color: 'blue',
    },
    {
      title: 'Success',
      value: stats.success_count,
      color: 'green',
    },
    {
      title: 'Failed',
      value: stats.failed_count,
      color: 'red',
    },
    {
      title: 'Pending',
      value: stats.pending_count,
      color: 'yellow',
    },
    {
      title: 'Total In',
      value: `$${stats.total_amount_in.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      color: 'green',
    },
    {
      title: 'Total Out',
      value: `$${stats.total_amount_out.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      color: 'red',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
        <div className="text-center py-8 text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)} text-white`}>
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status Distribution</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success</span>
              <Badge variant="success">{stats.success_count}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Failed</span>
              <Badge variant="failed">{stats.failed_count}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <Badge variant="pending">{stats.pending_count}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total In</span>
                <span className="text-sm font-semibold text-green-600">
                  ${stats.total_amount_in.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: stats.total_amount_in > 0 ? '85%' : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Out</span>
                <span className="text-sm font-semibold text-red-600">
                  ${stats.total_amount_out.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: stats.total_amount_out > 0 ? '15%' : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
