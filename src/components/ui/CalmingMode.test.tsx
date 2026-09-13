import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useCalmingModeStore } from '@/store/calmingModeStore';

const { CalmingMode } = await import('./CalmingMode');

describe('CalmingMode', () => {
    beforeEach(() => {
        vi.useRealTimers();
        useCalmingModeStore.setState({ isActive: false });
    });

    it('renders nothing when inactive', () => {
        const { container } = render(<CalmingMode />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the breathing screen and "Devam Edelim" button when active', () => {
        useCalmingModeStore.setState({ isActive: true });
        render(<CalmingMode />);

        expect(screen.getByText('Devam Edelim')).toBeInTheDocument();
        expect(screen.getByText(/Nefes/)).toBeInTheDocument();
    });

    it('deactivates the store when "Devam Edelim" is tapped (child-controlled dismissal, no forced timer)', () => {
        useCalmingModeStore.setState({ isActive: true });
        render(<CalmingMode />);

        fireEvent.click(screen.getByText('Devam Edelim'));

        expect(useCalmingModeStore.getState().isActive).toBe(false);
    });

    it('never mentions a diagnosis/judgment — only the two breath cues and the continue button', () => {
        useCalmingModeStore.setState({ isActive: true });
        render(<CalmingMode />);

        expect(screen.queryByText(/kriz|panik|bozukluk/i)).not.toBeInTheDocument();
    });
});
