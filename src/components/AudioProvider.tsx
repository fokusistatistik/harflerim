'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTurkishSpeech } from '@/hooks/useTurkishSpeech';
import type { AudioConfig, TurkishLetter } from '@/types/game';

interface AudioContextValue {
    speak: (text: string) => Promise<void>;
    askLetter: (letter: TurkishLetter) => Promise<void>;
    celebrateSuccess: () => Promise<void>;
    encourageRetry: () => Promise<void>;
    isSpeaking: boolean;
    isSupported: boolean;
    updateConfig: (config: Partial<AudioConfig>) => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

interface AudioProviderProps {
    children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
    const audioControls = useTurkishSpeech();

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
