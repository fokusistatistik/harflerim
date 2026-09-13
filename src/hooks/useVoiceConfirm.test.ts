import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockStartListening = vi.fn().mockResolvedValue(undefined);
const mockStopListening = vi.fn();
const mockResetTranscript = vi.fn();

let mockTranscript = '';
let mockListening = false;
let mockSupported = true;

vi.mock('react-speech-recognition', () => ({
    default: {
        startListening: (...args: unknown[]) => mockStartListening(...args),
        stopListening: (...args: unknown[]) => mockStopListening(...args),
    },
    useSpeechRecognition: () => ({
        transcript: mockTranscript,
        listening: mockListening,
        resetTranscript: mockResetTranscript,
        browserSupportsSpeechRecognition: mockSupported,
    }),
}));

const { useVoiceConfirm } = await import('./useVoiceConfirm');

describe('useVoiceConfirm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockTranscript = '';
        mockListening = false;
        mockSupported = true;
    });

    it('reports isSupported: false when the browser lacks speech recognition', () => {
        mockSupported = false;
        const onConfirmed = vi.fn();

        const { result } = renderHook(() => useVoiceConfirm('Anne', onConfirmed, true));

        expect(result.current.isSupported).toBe(false);
        expect(mockStartListening).not.toHaveBeenCalled();
    });

    it('does not start listening when disabled', () => {
        const onConfirmed = vi.fn();
        renderHook(() => useVoiceConfirm('Anne', onConfirmed, false));

        expect(mockStartListening).not.toHaveBeenCalled();
    });

    it('starts listening in Turkish when enabled and supported', () => {
        const onConfirmed = vi.fn();
        renderHook(() => useVoiceConfirm('Anne', onConfirmed, true));

        expect(mockStartListening).toHaveBeenCalledWith({ continuous: true, language: 'tr-TR' });
    });

    it('calls onConfirmed when the transcript tolerantly matches the target word', () => {
        const onConfirmed = vi.fn();
        const { rerender } = renderHook(({ target }) => useVoiceConfirm(target, onConfirmed, true), {
            initialProps: { target: 'Anne' },
        });

        mockTranscript = 'bu benim annem';
        rerender({ target: 'Anne' });

        expect(onConfirmed).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirmed when the transcript does not match', () => {
        const onConfirmed = vi.fn();
        const { rerender } = renderHook(({ target }) => useVoiceConfirm(target, onConfirmed, true), {
            initialProps: { target: 'Anne' },
        });

        mockTranscript = 'bu benim babam';
        rerender({ target: 'Anne' });

        expect(onConfirmed).not.toHaveBeenCalled();
    });

    it('only confirms once per target word even if the transcript keeps matching', () => {
        const onConfirmed = vi.fn();
        const { rerender } = renderHook(({ target }) => useVoiceConfirm(target, onConfirmed, true), {
            initialProps: { target: 'Anne' },
        });

        mockTranscript = 'annem';
        rerender({ target: 'Anne' });
        mockTranscript = 'annem geldi';
        rerender({ target: 'Anne' });

        expect(onConfirmed).toHaveBeenCalledTimes(1);
    });

    it('resets the confirmed flag when the target word changes', () => {
        const onConfirmed = vi.fn();
        const { rerender } = renderHook(({ target }) => useVoiceConfirm(target, onConfirmed, true), {
            initialProps: { target: 'Anne' as string | null },
        });

        mockTranscript = 'annem';
        rerender({ target: 'Anne' });
        expect(onConfirmed).toHaveBeenCalledTimes(1);

        act(() => {
            mockTranscript = '';
        });
        rerender({ target: 'Baba' });
        mockTranscript = 'babam';
        rerender({ target: 'Baba' });

        expect(onConfirmed).toHaveBeenCalledTimes(2);
    });
});
