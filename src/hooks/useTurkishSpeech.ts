'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioConfig } from '@/types/game';
import { tArray, interpolate } from '@/lib/i18n';

interface UseTurkishSpeechReturn {
    speak: (text: string) => Promise<void>;
    askLetter: (letter: string) => Promise<void>;
    celebrateSuccess: () => Promise<void>;
    encourageRetry: () => Promise<void>;
    isSpeaking: boolean;
    isSupported: boolean;
    updateConfig: (config: Partial<AudioConfig>) => void;
}

const DEFAULT_CONFIG: AudioConfig = {
    lang: 'tr-TR',
    pitch: 1.1,
    rate: 0.85,
    volume: 1.0,
};

export function useTurkishSpeech(enabled: boolean = true): UseTurkishSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [config, setConfig] = useState<AudioConfig>(DEFAULT_CONFIG);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
            setIsSupported(true);
        }
    }, []);

    // Bazı tarayıcılar (özellikle mobil Safari) kullanıcı etkileşimi olmadan
    // sesli konuşmayı engeller. İlk dokunuş/tıklama/tuşa kadar speak() sessizce
    // atlanır — hata fırlatmaz, konsolu kirletmez, oyun akışını bloklamaz.
    useEffect(() => {
        const unlock = () => {
            hasInteractedRef.current = true;
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        return () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, []);

    const speak = useCallback(
        async (text: string): Promise<void> => {
            if (!enabled) {
                return;
            }

            if (!synthRef.current || !isSupported) {
                console.warn('Speech synthesis not supported');
                return;
            }

            if (!hasInteractedRef.current) {
                return;
            }

            // Cancel any ongoing speech
            synthRef.current.cancel();

            return new Promise((resolve, reject) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = config.lang;
                utterance.pitch = config.pitch;
                utterance.rate = config.rate;
                utterance.volume = config.volume;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => {
                    setIsSpeaking(false);
                    resolve();
                };
                utterance.onerror = (event) => {
                    setIsSpeaking(false);
                    console.error('Speech synthesis error:', event);
                    reject(event);
                };

                synthRef.current!.speak(utterance);
            });
        },
        [config, isSupported, enabled]
    );

    // Faz 1.21 — bu cümleler artık src/locales/tr.json'dan okunuyor (tek
    // kaynak); daha önce burada hardcoded ve tr.json'dakiyle kısmen çakışan
    // ayrı diziler vardı.
    const askLetter = useCallback(
        async (letter: string): Promise<void> => {
            const phrases = tArray('game.findLetter').map((phrase) => interpolate(phrase, { letter }));
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            await speak(randomPhrase);
        },
        [speak]
    );

    const celebrateSuccess = useCallback(async (): Promise<void> => {
        const celebrations = tArray('feedback.success');
        const randomCelebration =
            celebrations[Math.floor(Math.random() * celebrations.length)];
        await speak(randomCelebration);
    }, [speak]);

    const encourageRetry = useCallback(async (): Promise<void> => {
        const encouragements = tArray('feedback.retry');
        const randomEncouragement =
            encouragements[Math.floor(Math.random() * encouragements.length)];
        await speak(randomEncouragement);
    }, [speak]);

    const updateConfig = useCallback((newConfig: Partial<AudioConfig>) => {
        setConfig((prev) => ({ ...prev, ...newConfig }));
    }, []);

    return {
        speak,
        askLetter,
        celebrateSuccess,
        encourageRetry,
        isSpeaking,
        isSupported,
        updateConfig,
    };
}
