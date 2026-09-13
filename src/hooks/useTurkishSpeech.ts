'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioConfig } from '@/types/game';
import { tArray, interpolate } from '@/lib/i18n';

interface UseTurkishSpeechReturn {
    speak: (text: string) => Promise<void>;
    askLetter: (letter: string) => Promise<void>;
    celebrateSuccess: () => Promise<void>;
    encourageRetry: () => Promise<void>;
    /** Faz 3.2b — Sakinleştirme Modu devreye girdiğinde her şeyi ANINDA susturur (Piper `<audio>` + tarayıcı speechSynthesis). */
    stop: () => void;
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
    /** Faz 3.2b — o an çalan Piper `<audio>` elementi, stop()'un durdurabilmesi için. */
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

    // Faz 3.5 — Piper TTS önce denenir (daha doğal/kaliteli Türkçe ses,
    // önceden üretilip önbelleklenen sabit külliyat için gecikmesiz). Başarısız
    // olursa (servis kapalı, ağ hatası vb.) mevcut tarayıcı speechSynthesis'ine
    // SESSİZCE düşülür — bu yüzden speak() asla reddedilmez/oyunu bozmaz.
    const speakWithPiper = useCallback(async (text: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            if (!response.ok) return false;

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            currentAudioRef.current = audio;

            await new Promise<void>((resolve, reject) => {
                // stop() bu event'lerden hiçbirini tetiklemez (pause "ended"
                // sayılmaz) — bu yüzden onpause'u da çözücü olarak bağlıyoruz,
                // stop() çağrıldığında bu Promise sonsuza kadar asılı kalmasın.
                audio.onended = () => resolve();
                audio.onpause = () => resolve();
                audio.onerror = () => reject(new Error('audio playback failed'));
                audio.play().catch(reject);
            });

            currentAudioRef.current = null;
            URL.revokeObjectURL(url);
            return true;
        } catch {
            return false;
        }
    }, []);

    const speak = useCallback(
        async (text: string): Promise<void> => {
            if (!enabled) {
                return;
            }

            if (!hasInteractedRef.current) {
                return;
            }

            setIsSpeaking(true);
            const piperWorked = await speakWithPiper(text);
            setIsSpeaking(false);
            if (piperWorked) return;

            if (!synthRef.current || !isSupported) {
                console.warn('Speech synthesis not supported');
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
        [config, isSupported, enabled, speakWithPiper]
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

    // Faz 3.2b — Sakinleştirme Modu tetiklendiğinde çağrılır: hem Piper
    // `<audio>`'yu hem tarayıcı speechSynthesis'ini ANINDA durdurur.
    const stop = useCallback(() => {
        currentAudioRef.current?.pause();
        currentAudioRef.current = null;
        synthRef.current?.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        askLetter,
        celebrateSuccess,
        encourageRetry,
        stop,
        isSpeaking,
        isSupported,
        updateConfig,
    };
}
