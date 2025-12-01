export const EMOTION_TYPES = [
    'happy',
    'sad',
    'anxious',
    'calm',
    'excited',
    'angry',
    'peaceful',
    'stressed',
] as const;

export const GAME_IDS = [
    'breathing-exercise',
    'meditation',
    'mood-tracker',
    'gratitude-journal',
] as const;

export const REWARDS = {
    EMOTION_LOG: 10,
    GAME_COMPLETION: 20,
    DAILY_STREAK: 50,
} as const;

export const VALIDATION_RULES = {
    WALLET_ADDRESS_LENGTH: 42,
    MIN_INTENSITY: 1,
    MAX_INTENSITY: 10,
    MIN_SCORE: 0,
    MAX_NOTES_LENGTH: 500,
} as const;
