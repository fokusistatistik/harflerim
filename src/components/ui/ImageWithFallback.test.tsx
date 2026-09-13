import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageWithFallback } from './ImageWithFallback';

describe('ImageWithFallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the image by default', () => {
        render(<ImageWithFallback src="/ok.png" alt="test" fallback={<span>yedek</span>} />);
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('shows the fallback when the image fires onError', () => {
        render(<ImageWithFallback src="/broken.png" alt="test" fallback={<span>yedek</span>} />);

        act(() => {
            fireEvent.error(screen.getByRole('img'));
        });

        expect(screen.getByText('yedek')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows the fallback when onLoad fires but naturalWidth is 0 (e.g. a 200 HTML error page)', () => {
        render(<ImageWithFallback src="/fake-200.png" alt="test" fallback={<span>yedek</span>} />);
        const img = screen.getByRole('img') as HTMLImageElement;
        Object.defineProperty(img, 'naturalWidth', { value: 0, configurable: true });

        act(() => {
            fireEvent.load(img);
        });

        expect(screen.getByText('yedek')).toBeInTheDocument();
    });

    it('keeps showing the image when it loads successfully (naturalWidth > 0)', () => {
        render(<ImageWithFallback src="/real.png" alt="test" fallback={<span>yedek</span>} />);
        const img = screen.getByRole('img') as HTMLImageElement;
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });

        act(() => {
            fireEvent.load(img);
            vi.advanceTimersByTime(10000);
        });

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.queryByText('yedek')).not.toBeInTheDocument();
    });

    it('falls back on its own after the timeout even if neither onError nor onLoad ever fires (hung request)', () => {
        render(<ImageWithFallback src="/hangs-forever.png" alt="test" fallback={<span>yedek</span>} timeoutMs={4000} />);

        act(() => {
            vi.advanceTimersByTime(4001);
        });

        expect(screen.getByText('yedek')).toBeInTheDocument();
    });
});
