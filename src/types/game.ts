/**
 * Game State Machine Status
 */
export type GameStatus = 'IDLE' | 'LISTENING' | 'FEEDBACK' | 'SUCCESS';

/**
 * Turkish Letters used in the game
 */
export const TURKISH_LETTERS = [
    'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
    'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
    'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
] as const;

export type TurkishLetter = typeof TURKISH_LETTERS[number];

/**
 * Game State Interface
 */
export interface GameState {
    status: GameStatus;
    sessionID: string;
    currentAttemptID: string;
    targetLetter: TurkishLetter | null;
    displayedLetters: [TurkishLetter, TurkishLetter] | null;
    attemptStartTime: number | null;
    totalAttempts: number;
    successfulAttempts: number;
}

/**
 * Telemetry Object for Analytics
 */
export interface TelemetryEvent {
    sessionID: string;
    attemptID: string;
    target: TurkishLetter;
    chosen: TurkishLetter;
    isSuccess: boolean;
    timeToReactMS: number;
    screenOrientation: 'portrait' | 'landscape';
    timestamp: number;
}

/**
 * Analytics Summary
 */
export interface AnalyticsSummary {
    totalAttempts: number;
    successRate: number;
    averageReactionTime: number;
    letterAccuracy: Record<TurkishLetter, {
        attempts: number;
        successes: number;
        averageTime: number;
    }>;
    sessionDuration: number;
}

/**
 * Theme Configuration for ASD-friendly visuals
 */
export interface ThemeConfig {
    background: string;
    cardBackground: string;
    correctColor: string;
    incorrectColor: string;
    textColor: string;
    accentColor: string;
}

/**
 * Audio Configuration
 */
export interface AudioConfig {
    lang: string;
    pitch: number;
    rate: number;
    volume: number;
}
