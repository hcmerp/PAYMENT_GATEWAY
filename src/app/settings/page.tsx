'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';

const Settings = () => {
    const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhook/callback');
    const [telegramNotify, setTelegramNotify] = useState(true);
    const [secretKey, setSecretKey] = useState('sk_live_****************');
    const [showSecret, setShowSecret] = useState(false);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="space-y-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Webhook URL
                            </label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="https://api.example.com/webhook/callback"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                The URL where payment gateways will send callback notifications
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Secret Key
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                    placeholder="sk_live_..."
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                                >
                                    {showSecret ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Used to verify webhook signature from payment gateways
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                    Telegram Notifications
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Receive transaction alerts via Telegram
                                </p>
                            </div>
                            <button
                                onClick={() => setTelegramNotify(!telegramNotify)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${telegramNotify ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${telegramNotify ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                        {telegramNotify && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telegram Bot Token
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enter your Telegram bot token to enable notifications
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                        Cancel
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;