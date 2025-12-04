/**
 * MiniPay Detection and Utilities
 * MiniPay is Opera's mobile wallet for Celo
 */

export interface MiniPayProvider {
    isMiniPay?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * Check if MiniPay is available
 */
export function isMiniPay(): boolean {
    if (typeof window === 'undefined') return false;

    const ethereum = window.ethereum as MiniPayProvider;

    // MiniPay sets isMiniPay flag
    if (ethereum?.isMiniPay) return true;

    // Fallback: Check user agent for Opera Mini
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('opera mini') || userAgent.includes('minipay');
}

/**
 * Get MiniPay provider
 */
export function getMiniPayProvider(): MiniPayProvider | null {
    if (!isMiniPay()) return null;
    return window.ethereum as MiniPayProvider;
}

/**
 * Request MiniPay connection
 */
export async function connectMiniPay(): Promise<string[]> {
    const provider = getMiniPayProvider();
    if (!provider) {
        throw new Error('MiniPay not detected');
    }

    try {
        const accounts = await provider.request({
            method: 'eth_requestAccounts'
        });
        return accounts as string[];
    } catch (error) {
        console.error('MiniPay connection error:', error);
        throw error;
    }
}

/**
 * Check if user is on mobile
 */
export function isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Get MiniPay download link
 */
export function getMiniPayDownloadLink(): string {
    return 'https://www.opera.com/products/minipay';
}
