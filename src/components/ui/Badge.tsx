'use client';

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'failed' | 'pending' | 'unknown' | 'open' | 'investigating' | 'resolved' | 'active' | 'disabled';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'unknown' }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
            case 'resolved':
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'failed':
            case 'disabled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
            case 'open':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'investigating':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'unknown':
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantStyles()}`}>
            {children}
        </span>
    );
};

export default Badge;