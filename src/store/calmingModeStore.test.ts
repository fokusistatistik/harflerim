import { describe, expect, it, beforeEach } from 'vitest';
import { useCalmingModeStore } from './calmingModeStore';

describe('useCalmingModeStore', () => {
    beforeEach(() => {
        useCalmingModeStore.setState({ isActive: false });
    });

    it('starts inactive', () => {
        expect(useCalmingModeStore.getState().isActive).toBe(false);
    });

    it('activate() sets isActive to true', () => {
        useCalmingModeStore.getState().activate();
        expect(useCalmingModeStore.getState().isActive).toBe(true);
    });

    it('deactivate() sets isActive back to false', () => {
        useCalmingModeStore.getState().activate();
        useCalmingModeStore.getState().deactivate();
        expect(useCalmingModeStore.getState().isActive).toBe(false);
    });
});
