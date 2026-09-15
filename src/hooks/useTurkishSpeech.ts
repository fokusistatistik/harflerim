'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioConfig } from '@/types/game';
import { pickTtsAsset, pickRandomTtsAssetForCategory } from '@/lib/ttsManifest';

interface UseTurkishSpeechReturn {
    speak: (text: string) => Promise<void>;
    askLetter: (letter: string) => Promise<void>;
    celebrateSuccess: () => Promise<void>;
    encourageRetry: () => Promise<void>;
    /** Sakinleştirme Modu devreye girdiğinde çalan sesi ANINDA susturur. */
    stop: () => void;
    isSpeaking: boolean;
    /** 2026-09-15, 3. tur'dan itibaren her zaman true — statik mp3 tabanlı oynatma her tarayıcıda çalışır, Web Speech API desteğine bağlı değil. Arayüz geriye dönük uyumluluk için korunuyor (bkz. AudioProvider.tsx). */
    isSupported: boolean;
    /** 2026-09-15, 3. tur'dan itibaren no-op — pitch/rate/volume yalnızca speechSynthesis'e özgüydü, artık kullanılmıyor. Arayüz geriye dönük uyumluluk için korunuyor. */
    updateConfig: (config: Partial<AudioConfig>) => void;
}

export function useTurkishSpeech(enabled: boolean = true): UseTurkishSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const hasInteractedRef = useRef(false);
    /** O an çalan `<audio>` elementi, stop()'un durdurabilmesi için. */
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

    /**
     * 2026-09-15, 3. tur — kullanıcı isteği: "sadece mp3 kayıtlardan seçsin",
     * robotik (Piper/tarayıcı) sese hiç düşülmesin. Piper (`/api/tts`) ve
     * tarayıcı `speechSynthesis` zincirleri TAMAMEN KALDIRILDI — `speak()`
     * artık yalnızca `ttsManifest.ts`'teki kayıtlı statik dosyaları çalar,
     * eşleşme yoksa SESSİZ kalır (oyun akışını bozmaz, ama ses de çıkmaz).
     * Bu özgün-anlamlı metinler için doğru davranış (AAC, "Bu kim?" gibi —
     * rastgele başka bir kelime çalınırsa çocuk yanlış bilgi duyar).
     * Rastgele-havuzlu metinler (kutlama/teşvik/harf sorma) için ise
     * `celebrateSuccess`/`encourageRetry`/`askLetter` artık `tr.json`'dan
     * DEĞİL doğrudan mevcut ses kayıtları arasından seçiyor — bu yüzden
     * onlar için asla "eksik" durumu oluşmaz.
     */
    const playAsset = useCallback(async (assetPath: string | null): Promise<void> => {
        if (!assetPath) return;
        try {
            const audio = new Audio(assetPath);
            currentAudioRef.current = audio;
            await new Promise<void>((resolve, reject) => {
                audio.onended = () => resolve();
                audio.onpause = () => resolve();
                audio.onerror = () => reject(new Error('local tts asset playback failed'));
                audio.play().catch(reject);
            });
            currentAudioRef.current = null;
        } catch {
            currentAudioRef.current = null;
        }
    }, []);

    const speak = useCallback(
        async (text: string): Promise<void> => {
            if (!enabled || !hasInteractedRef.current) return;
            setIsSpeaking(true);
            await playAsset(pickTtsAsset(text));
            setIsSpeaking(false);
        },
        [enabled, playAsset]
    );

    // Harfe özgü — yanlış harf çalınamaz. Bu harfin 3 olası şablonundan
    // (Hadi X bulalım / X nerede / Bakalım X) hangileri kayıtlıysa arasından
    // rastgele biri seçilir; hiçbiri kayıtlı değilse sessiz kalır (bkz. dosya
    // başı yorumu — robotik sese düşülmüyor).
    const askLetter = useCallback(
        async (letter: string): Promise<void> => {
            if (!enabled || !hasInteractedRef.current) return;
            const candidates = [
                `Hadi ${letter} harfini bulalım!`,
                `${letter} harfi nerede?`,
                `Bakalım, ${letter} harfini bulabilecek misin?`,
            ];
            const availablePaths = candidates.map(pickTtsAsset).filter((p): p is string => p !== null);
            const assetPath = availablePaths.length > 0
                ? availablePaths[Math.floor(Math.random() * availablePaths.length)]
                : null;
            setIsSpeaking(true);
            await playAsset(assetPath);
            setIsSpeaking(false);
        },
        [enabled, playAsset]
    );

    const celebrateSuccess = useCallback(async (): Promise<void> => {
        if (!enabled || !hasInteractedRef.current) return;
        setIsSpeaking(true);
        await playAsset(pickRandomTtsAssetForCategory('kutlama'));
        setIsSpeaking(false);
    }, [enabled, playAsset]);

    const encourageRetry = useCallback(async (): Promise<void> => {
        if (!enabled || !hasInteractedRef.current) return;
        setIsSpeaking(true);
        await playAsset(pickRandomTtsAssetForCategory('tesvik'));
        setIsSpeaking(false);
    }, [enabled, playAsset]);

    /** Geriye dönük uyumluluk için imza korunuyor (bkz. UseTurkishSpeechReturn), artık no-op. */
    const updateConfig = useCallback((newConfig: Partial<AudioConfig>) => {
        void newConfig;
    }, []);

    // Faz 3.2b — Sakinleştirme Modu tetiklendiğinde çağrılır: o an çalan sesi ANINDA durdurur.
    const stop = useCallback(() => {
        currentAudioRef.current?.pause();
        currentAudioRef.current = null;
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        askLetter,
        celebrateSuccess,
        encourageRetry,
        stop,
        isSpeaking,
        isSupported: true,
        updateConfig,
    };
}
