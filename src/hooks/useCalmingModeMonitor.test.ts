import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockCheckCalmingModeTrigger = vi.fn();
const mockStop = vi.fn();

vi.mock('@/actions/calmingMode', () => ({ checkCalmingModeTrigger: mockCheckCalmingModeTrigger }));
vi.mock('@/components/AudioProvider', () => ({ useAudio: () => ({ stop: mockStop }) }));

const { useCalmingModeMonitor } = await import('./useCalmingModeMonitor');
const { useCalmingModeStore } = await import('@/store/calmingModeStore');
const { useNotificationStore } = await import('@/store/notificationStore');

describe('useCalmingModeMonitor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCalmingModeStore.setState({ isActive: false });
        useNotificationStore.setState({ toasts: [] });
    });

    it('does nothing when the trigger check resolves to false', async () => {
        mockCheckCalmingModeTrigger.mockResolvedValue(false);
        const { result } = renderHook(() => useCalmingModeMonitor('harf-tanima'));

        await act(async () => {
            result.current(false);
        });

        expect(useCalmingModeStore.getState().isActive).toBe(false);
        expect(mockStop).not.toHaveBeenCalled();
        expect(useNotificationStore.getState().toasts).toHaveLength(0);
    });

    it('activates calming mode, stops audio, and pushes a parent-scope toast when triggered', async () => {
        mockCheckCalmingModeTrigger.mockResolvedValue(true);
        const { result } = renderHook(() => useCalmingModeMonitor('harf-tanima'));

        await act(async () => {
            result.current(false);
        });

        expect(useCalmingModeStore.getState().isActive).toBe(true);
        expect(mockStop).toHaveBeenCalledTimes(1);

        const toasts = useNotificationStore.getState().toasts;
        expect(toasts).toHaveLength(1);
        expect(toasts[0].scope).toBe('parent');
    });

    it('checks the skill key it was created with', async () => {
        mockCheckCalmingModeTrigger.mockResolvedValue(false);
        const { result } = renderHook(() => useCalmingModeMonitor('gorsel-hafiza'));

        await act(async () => {
            result.current(true);
        });

        expect(mockCheckCalmingModeTrigger).toHaveBeenCalledWith('gorsel-hafiza');
    });

    it('never throws even if the trigger check rejects', async () => {
        mockCheckCalmingModeTrigger.mockRejectedValue(new Error('network'));
        const { result } = renderHook(() => useCalmingModeMonitor('harf-tanima'));

        await act(async () => {
            expect(() => result.current(false)).not.toThrow();
        });
    });
});
