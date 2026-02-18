'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { api, BackendTransaction } from '@/lib/api';

interface TestResult {
    success: boolean;
    timestamp: string;
    type: 'deposit' | 'withdraw';
    data?: any;
    error?: string;
}

const TestPage = () => {
    // Deposit test state
    const [depositData, setDepositData] = useState({
        uniqueTransactionId: '',
        reference: '',
        totalAmount: 100,
        currency: 'USD',
        status: 'success',
        code: 0,
        message: 'Test deposit',
    });

    // Withdraw test state
    const [withdrawData, setWithdrawData] = useState({
        referenceId: '',
        amount: 100,
        currency: 'USD',
        gateway: 'maxpay',
    });

    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const generateReferenceId = () => {
        return `TEST-${Date.now()}`;
    };

    const handleDepositTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                uniqueTransactionId: depositData.uniqueTransactionId || `TXN-${Date.now()}`,
                reference: depositData.reference,
                totalAmount: depositData.totalAmount,
                currency: depositData.currency,
                transactionType: 'SALE',
                status: depositData.status,
                message: depositData.message,
                code: depositData.code,
                testMode: '1',
            };

            const response = await api.triggerMaxpayWebhook(payload);

            const result: TestResult = {
                success: response.success,
                timestamp: new Date().toISOString(),
                type: 'deposit',
                data: payload,
                error: response.error,
            };

            setTestResults((prev) => [result, ...prev]);
        } catch (error) {
            const result: TestResult = {
                success: false,
                timestamp: new Date().toISOString(),
                type: 'deposit',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            setTestResults((prev) => [result, ...prev]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdrawTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await api.createWithdrawal({
                referenceId: withdrawData.referenceId,
                amount: withdrawData.amount,
                currency: withdrawData.currency,
                gateway: withdrawData.gateway as 'maxpay' | 'corepay',
            });

            const result: TestResult = {
                success: response.success,
                timestamp: new Date().toISOString(),
                type: 'withdraw',
                data: response.data,
                error: response.error,
            };

            setTestResults((prev) => [result, ...prev]);
        } catch (error) {
            const result: TestResult = {
                success: false,
                timestamp: new Date().toISOString(),
                type: 'withdraw',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
            setTestResults((prev) => [result, ...prev]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showResultDetails = (result: TestResult) => {
        setModalData(result);
        setShowModal(true);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Test Payment System</h1>
                {testResults.length > 0 && (
                    <button
                        onClick={clearResults}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                    >
                        Clear Results
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposit Test Form */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💰</span> Test Deposit (Webhook Simulation)
                    </h2>
                    <form onSubmit={handleDepositTest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference ID
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={depositData.reference}
                                    onChange={(e) => setDepositData({ ...depositData, reference: e.target.value })}
                                    placeholder={`e.g., ${generateReferenceId()}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setDepositData({ ...depositData, reference: generateReferenceId() })}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={depositData.totalAmount}
                                onChange={(e) => setDepositData({ ...depositData, totalAmount: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                value={depositData.currency}
                                onChange={(e) => setDepositData({ ...depositData, currency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="THB">THB</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={depositData.status}
                                onChange={(e) => {
                                    const status = e.target.value;
                                    const code = status === 'success' ? 0 : 1;
                                    setDepositData({ ...depositData, status, code });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                            </label>
                            <input
                                type="text"
                                value={depositData.message}
                                onChange={(e) => setDepositData({ ...depositData, message: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Testing Deposit...' : 'Test Deposit'}
                        </button>
                    </form>
                </Card>

                {/* Withdraw Test Form */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💸</span> Test Withdrawal
                    </h2>
                    <form onSubmit={handleWithdrawTest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference ID
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={withdrawData.referenceId}
                                    onChange={(e) => setWithdrawData({ ...withdrawData, referenceId: e.target.value })}
                                    placeholder={`e.g., ${generateReferenceId()}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setWithdrawData({ ...withdrawData, referenceId: generateReferenceId() })}
                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount
                            </label>
                            <input
                                type="number"
                                value={withdrawData.amount}
                                onChange={(e) => setWithdrawData({ ...withdrawData, amount: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                value={withdrawData.currency}
                                onChange={(e) => setWithdrawData({ ...withdrawData, currency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="THB">THB</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gateway
                            </label>
                            <select
                                value={withdrawData.gateway}
                                onChange={(e) => setWithdrawData({ ...withdrawData, gateway: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="maxpay">Maxpay</option>
                                <option value="corepay">Corepay</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Testing Withdrawal...' : 'Test Withdrawal'}
                        </button>
                    </form>
                </Card>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
                    <div className="space-y-3">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition ${result.success
                                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                    : 'border-red-200 bg-red-50 hover:bg-red-100'
                                    }`}
                                onClick={() => showResultDetails(result)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {result.type === 'deposit' ? '💰' : '💸'}
                                        </span>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {result.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Test
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(result.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${result.success
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {result.success ? 'Success' : 'Failed'}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Detail Modal */}
            {showModal && modalData && (
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Test Result Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Type:</span>
                                <span className="ml-2 font-semibold">
                                    {modalData.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Timestamp:</span>
                                <span className="ml-2">{new Date(modalData.timestamp).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Status:</span>
                                <span
                                    className={`ml-2 px-2 py-1 rounded text-sm ${modalData.success
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {modalData.success ? 'Success' : 'Failed'}
                                </span>
                            </div>
                            {modalData.error && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Error:</span>
                                    <div className="mt-1 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                                        {modalData.error}
                                    </div>
                                </div>
                            )}
                            {modalData.data && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Response Data:</span>
                                    <pre className="mt-1 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-64">
                                        {JSON.stringify(modalData.data, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default TestPage;