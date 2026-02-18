'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/transactions', label: 'Transactions', icon: '💳' },
        { href: '/test', label: 'Test System', icon: '🧪' },
        { href: '/cases', label: 'Cases', icon: '📋' },
        { href: '/accounts', label: 'Accounts', icon: '🔐' },
        { href: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-white">Payment Admin</h1>
                <p className="text-xs text-gray-400 mt-1">Gateway Management</p>
            </div>
            <nav className="mt-6">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === item.href
                            ? 'bg-gray-800 text-white border-r-4 border-blue-500'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        A
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Admin</p>
                        <p className="text-xs text-gray-400">admin@company.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;