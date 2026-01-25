import type { ThemeConfig } from '@/types/game';

/**
 * ASD-Friendly Theme Configuration
 * Avoids pure white (#FFFFFF) and uses softer, calming tones
 */
export const ASD_THEME: ThemeConfig = {
    background: '#FFFDD0', // Cream - soft, warm background
    cardBackground: '#F5F5DC', // Beige - gentle card background
    correctColor: '#98D8C8', // Pastel Mint Green - calming success color
    incorrectColor: '#FFB6C1', // Light Pink - gentle error indication
    textColor: '#2C3E50', // Dark Blue-Gray - high contrast but not harsh
    accentColor: '#87CEEB', // Sky Blue - pleasant accent
};

/**
 * Additional color palette for visual variety
 */
export const COLOR_PALETTE = {
    pastelBlue: '#B0E0E6',
    pastelGreen: '#98FB98',
    pastelYellow: '#FFFFE0',
    pastelPurple: '#DDA0DD',
    pastelOrange: '#FFDAB9',
    softGray: '#E8E8E8',
};

/**
 * Animation durations (in milliseconds)
 * Kept moderate to avoid overwhelming sensory input
 */
export const ANIMATION_DURATIONS = {
    breathe: 2000, // Breathing effect cycle
    feedback: 1500, // Success/error feedback
    transition: 500, // Card transitions
    delay: 2000, // Delay before next round
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
};
