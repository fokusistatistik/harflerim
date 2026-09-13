'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTurkishSpeech } from '@/hooks/useTurkishSpeech';
import type { AudioConfig } from '@/types/game';

interface AudioContextValue {
    speak: (text: string) => Promise<void>;
    askLetter: (letter: string) => Promise<void>;
    celebrateSuccess: () => Promise<void>;
    encourageRetry: () => Promise<void>;
    stop: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
    updateConfig: (config: Partial<AudioConfig>) => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

interface AudioProviderProps {
    children: ReactNode;
    speechEnabled?: boolean;
}

export function AudioProvider({ children, speechEnabled = true }: AudioProviderProps) {
    const audioControls = useTurkishSpeech(speechEnabled);

    return (
        <AudioContext.Provider value={audioControls}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio(): AudioContextValue {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
