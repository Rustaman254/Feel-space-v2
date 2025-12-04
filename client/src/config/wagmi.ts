import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { celo, celoAlfajores, base, baseSepolia, scroll, scrollSepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from '@wagmi/connectors';

// Detect if running in MiniPay in-app browser
export function isMiniPayInApp(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    return (
        userAgent.includes('minipay') ||
        (typeof window.ethereum !== 'undefined' &&
            (window.ethereum as any).isMiniPay === true)
    );
}

// Detect if running in Farcaster mini app
export function isFarcasterInApp(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    return (
        userAgent.includes('farcaster') ||
        (typeof window !== 'undefined' && (window as any).farcaster !== undefined)
    );
}

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Define chains based on environment
// For production, use mainnet chains (celo, base, scroll)
// For development/testing, use testnets
const chains = [
    celoAlfajores, // Celo Alfajores Testnet (primary)
    baseSepolia,   // Base Sepolia Testnet
    scrollSepolia, // Scroll Sepolia Testnet
    // Uncomment for mainnet:
    // celo,
    // base,
    // scroll,
] as const;

// Configure transports for each chain
const transports = {
    [celoAlfajores.id]: http(
        import.meta.env.VITE_CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org'
    ),
    [baseSepolia.id]: http(
        import.meta.env.VITE_BASE_RPC_URL || 'https://sepolia.base.org'
    ),
    [scrollSepolia.id]: http(
        import.meta.env.VITE_SCROLL_RPC_URL || 'https://sepolia-rpc.scroll.io'
    ),
    // Uncomment for mainnet:
    // [celo.id]: http(import.meta.env.VITE_CELO_RPC_URL || 'https://forno.celo.org'),
    // [base.id]: http(import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org'),
    // [scroll.id]: http(import.meta.env.VITE_SCROLL_RPC_URL || 'https://rpc.scroll.io'),
};

// Configure connectors based on platform
function getConnectors() {
    const connectors = [];

    // Always include injected connector for MetaMask, MiniPay, and other browser wallets
    connectors.push(
        injected({
            target() {
                return {
                    id: 'injected',
                    name: isMiniPayInApp()
                        ? 'MiniPay'
                        : isFarcasterInApp()
                            ? 'Farcaster Wallet'
                            : 'Browser Wallet',
                    provider: typeof window !== 'undefined' ? window.ethereum : undefined,
                };
            },
        })
    );

    // Only add WalletConnect and Coinbase Wallet in browser (not in mini apps)
    if (!isMiniPayInApp() && !isFarcasterInApp()) {
        // WalletConnect connector
        if (WALLETCONNECT_PROJECT_ID && WALLETCONNECT_PROJECT_ID !== 'YOUR_PROJECT_ID') {
            connectors.push(
                walletConnect({
                    projectId: WALLETCONNECT_PROJECT_ID,
                    metadata: {
                        name: 'Feel-Space',
                        description: 'Track your emotions and earn rewards',
                        url: typeof window !== 'undefined' ? window.location.origin : 'https://feelspace.app',
                        icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : ''],
                    },
                    showQrModal: true,
                })
            );
        }

        // Coinbase Wallet connector
        connectors.push(
            coinbaseWallet({
                appName: 'Feel-Space',
                appLogoUrl: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : undefined,
            })
        );
    }

    return connectors;
}

// Create Wagmi config
export const config = createConfig({
    chains,
    connectors: getConnectors(),
    transports,
    ssr: false,
    storage: createStorage({
        storage: typeof window !== 'undefined' ? cookieStorage : undefined,
    }),
});

// Export chain IDs for easy reference
export const CHAIN_IDS = {
    CELO_ALFAJORES: celoAlfajores.id,
    BASE_SEPOLIA: baseSepolia.id,
    SCROLL_SEPOLIA: scrollSepolia.id,
    // Uncomment for mainnet:
    // CELO: celo.id,
    // BASE: base.id,
    // SCROLL: scroll.id,
} as const;

// Contract addresses for each chain
export const CONTRACT_ADDRESSES = {
    [celoAlfajores.id]: import.meta.env.VITE_CONTRACT_ADDRESS_CELO || '',
    [baseSepolia.id]: import.meta.env.VITE_CONTRACT_ADDRESS_BASE || '',
    [scrollSepolia.id]: import.meta.env.VITE_CONTRACT_ADDRESS_SCROLL || '',
    // Uncomment for mainnet:
    // [celo.id]: import.meta.env.VITE_CONTRACT_ADDRESS_CELO_MAINNET || '',
    // [base.id]: import.meta.env.VITE_CONTRACT_ADDRESS_BASE_MAINNET || '',
    // [scroll.id]: import.meta.env.VITE_CONTRACT_ADDRESS_SCROLL_MAINNET || '',
} as const;

// Helper to get contract address for current chain
export function getContractAddress(chainId: number): string {
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || '';
}

// Chain display names
export const CHAIN_NAMES = {
    [celoAlfajores.id]: 'Celo Alfajores',
    [baseSepolia.id]: 'Base Sepolia',
    [scrollSepolia.id]: 'Scroll Sepolia',
    // Uncomment for mainnet:
    // [celo.id]: 'Celo',
    // [base.id]: 'Base',
    // [scroll.id]: 'Scroll',
} as const;

// Export chains for use in components
export { chains };
