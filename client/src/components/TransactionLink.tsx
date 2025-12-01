import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionLinkProps {
    txHash: string;
    network?: 'alfajores' | 'celo';
    className?: string;
    showIcon?: boolean;
}

export function TransactionLink({
    txHash,
    network = 'alfajores',
    className = '',
    showIcon = true
}: TransactionLinkProps) {
    if (!txHash) return null;

    const explorerUrl = network === 'alfajores'
        ? 'https://alfajores.celoscan.io'
        : 'https://celoscan.io';

    const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;

    return (
        <Button asChild variant="outline" className={`btn-flat px-3 py-2 text-sm font-bold ${className}`}>
            <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`View transaction: ${txHash}`}
            >
                <span>{shortHash}</span>
                {showIcon && <ExternalLink className="w-3 h-3 ml-2" />}
            </a>
        </Button>
    );
}
