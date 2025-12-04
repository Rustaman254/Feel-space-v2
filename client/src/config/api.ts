// API Configuration
// Uses environment variable in production, falls back to localhost in development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

// API Endpoints
export const API_ENDPOINTS = {
    emotions: {
        log: `${API_URL}/api/emotions/log`,
        history: (walletAddress: string) => `${API_URL}/api/emotions/history/${walletAddress}`,
        analytics: (walletAddress: string, days: number = 30) =>
            `${API_URL}/api/emotions/analytics/${walletAddress}?days=${days}`,
        insights: (walletAddress: string, days: number = 30) =>
            `${API_URL}/api/emotions/insights/${walletAddress}?days=${days}`,
        trends: (walletAddress: string, days: number = 30) =>
            `${API_URL}/api/emotions/trends/${walletAddress}?days=${days}`,
    },
    games: {
        complete: `${API_URL}/api/games/complete`,
        history: (walletAddress: string) => `${API_URL}/api/games/history/${walletAddress}`,
    },
};
