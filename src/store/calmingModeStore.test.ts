import { describe, expect, it, beforeEach } from 'vitest';
import { useCalmingModeStore } from './calmingModeStore';

describe('useCalmingModeStore', () => {
    beforeEach(() => {
        useCalmingModeStore.setState({ isActive: false, acknowledged: false });
    });

    it('starts inactive and unacknowledged', () => {
        expect(useCalmingModeStore.getState().isActive).toBe(false);
        expect(useCalmingModeStore.getState().acknowledged).toBe(false);
    });

    it('activate() sets isActive to true and clears acknowledged', () => {
        useCalmingModeStore.setState({ acknowledged: true });
        useCalmingModeStore.getState().activate();
        expect(useCalmingModeStore.getState().isActive).toBe(true);
        expect(useCalmingModeStore.getState().acknowledged).toBe(false);
    });

    it('deactivate() sets isActive back to false and sets acknowledged', () => {
        useCalmingModeStore.getState().activate();
        useCalmingModeStore.getState().deactivate();
        expect(useCalmingModeStore.getState().isActive).toBe(false);
        expect(useCalmingModeStore.getState().acknowledged).toBe(true);
    });

    it('clearAcknowledged() resets acknowledged to false', () => {
        useCalmingModeStore.getState().deactivate();
        useCalmingModeStore.getState().clearAcknowledged();
        expect(useCalmingModeStore.getState().acknowledged).toBe(false);
    });
});
