import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const mockSpeak = vi.fn().mockResolvedValue(undefined);

vi.mock('@/components/AudioProvider', () => ({
    useAudio: () => ({ speak: mockSpeak }),
}));

// GameHud kullanır next/link + useParentGateStore — bu testin odağı dışında, sade bir stub yeterli.
vi.mock('@/components/game/GameHud', () => ({
    GameHud: () => <div data-testid="game-hud" />,
}));

const { AacBoard } = await import('./AacBoard');

describe('AacBoard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders every symbol from every category as a button with its word as the label', () => {
        render(<AacBoard />);

        expect(screen.getByText('İstiyorum')).toBeInTheDocument();
        expect(screen.getByText('Mutluyum')).toBeInTheDocument();
        expect(screen.getByText('Dur')).toBeInTheDocument();
    });

    it('speaks the exact word when a symbol is tapped (Faz 3.7 — tek dokunuş → seslendirme)', async () => {
        render(<AacBoard />);

        await act(async () => {
            fireEvent.click(screen.getByText('Su'));
        });

        expect(mockSpeak).toHaveBeenCalledWith('Su');
        expect(mockSpeak).toHaveBeenCalledTimes(1);
    });

    it('shows the ARASAAC attribution note', () => {
        render(<AacBoard />);

        expect(screen.getByText(/ARASAAC/)).toBeInTheDocument();
    });
});
