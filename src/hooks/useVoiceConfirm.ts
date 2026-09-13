'use client';

import { useEffect, useRef } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export interface VoiceConfirmState {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
}

/**
 * Faz 2.9 — sözlü onay mekanizması. Sihirli Kelimeler'in (Faz 1) konuşma
 * tanıma altyapısını genel bir hook'a çıkarır: "sihirli kelimeyi söyle"
 * adımı, kimin konuştuğunu AYIRT ETMEZ — bu bilinçli bir ara adımdır,
 * gerçek konuşmacı tanıma Faz 3.3'ün işi. Toleranslı eşleştirme (tam
 * cümle değil, hedef kelimeyi içeriyor mu) MagicWordsGame'deki desenle
 * birebir aynı. Tarayıcı desteklemiyorsa veya izin verilmemişse
 * `isSupported: false` döner — çağıran taraf HER ZAMAN dokunmatik bir
 * alternatif sunmalı (roadmap: "her otomatik onayın elle alternatifi var").
 */
export function useVoiceConfirm(
    targetWord: string | null,
    onConfirmed: () => void,
    enabled: boolean = true
): VoiceConfirmState {
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const hasConfirmedRef = useRef(false);

    useEffect(() => {
        hasConfirmedRef.current = false;
        resetTranscript();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetWord]);

    useEffect(() => {
        if (!enabled || !browserSupportsSpeechRecognition) return;

        SpeechRecognition.startListening({ continuous: true, language: 'tr-TR' }).catch(() => {});
        return () => {
            SpeechRecognition.stopListening();
        };
    }, [enabled, browserSupportsSpeechRecognition]);

    useEffect(() => {
        if (!enabled || !targetWord || !transcript || hasConfirmedRef.current) return;

        const spoken = transcript.toLocaleLowerCase('tr-TR').trim();
        const target = targetWord.toLocaleLowerCase('tr-TR').trim();

        if (spoken.includes(target)) {
            hasConfirmedRef.current = true;
            resetTranscript();
            onConfirmed();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, targetWord, enabled]);

    return {
        isListening: listening,
        isSupported: browserSupportsSpeechRecognition,
        transcript,
    };
}
