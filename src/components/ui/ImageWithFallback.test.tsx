import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageWithFallback } from './ImageWithFallback';

describe('ImageWithFallback', () => {
    it('varsayılan olarak görseli gösterir', () => {
        render(<ImageWithFallback src="/ok.png" alt="test" fallback={<span>yedek</span>} />);
        expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('görsel onError tetiklediğinde yedeği gösterir', () => {
        render(<ImageWithFallback src="/broken.png" alt="test" fallback={<span>yedek</span>} />);

        act(() => {
            fireEvent.error(screen.getByRole('img'));
        });

        expect(screen.getByText('yedek')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('onLoad tetiklenip naturalWidth 0 ise (200 dönen HTML hata sayfası) yedeğe düşer', () => {
        render(<ImageWithFallback src="/fake-200.png" alt="test" fallback={<span>yedek</span>} />);
        const img = screen.getByRole('img') as HTMLImageElement;
        Object.defineProperty(img, 'complete', { value: true, configurable: true });
        Object.defineProperty(img, 'naturalWidth', { value: 0, configurable: true });

        act(() => {
            fireEvent.load(img);
        });

        expect(screen.getByText('yedek')).toBeInTheDocument();
    });

    it('görsel başarıyla yüklendiğinde (naturalWidth > 0) görseli göstermeye devam eder', () => {
        render(<ImageWithFallback src="/real.png" alt="test" fallback={<span>yedek</span>} />);
        const img = screen.getByRole('img') as HTMLImageElement;
        Object.defineProperty(img, 'complete', { value: true, configurable: true });
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });

        act(() => {
            fireEvent.load(img);
        });

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.queryByText('yedek')).not.toBeInTheDocument();
    });

    // Regresyon (2026-09-14): görsel cache'ten hydration'dan önce yüklenince
    // React'in onLoad'u hiç tetiklenmiyor. Eski zaman aşımı mantığı bu durumda
    // sağlam görseli 4 sn sonra yedek ikona çeviriyordu.
    it('onLoad hiç tetiklenmese bile sağlam görseli yedeğe çevirmez', () => {
        render(<ImageWithFallback src="/cached.png" alt="test" fallback={<span>yedek</span>} />);

        expect(screen.getByRole('img')).toBeInTheDocument();
        expect(screen.queryByText('yedek')).not.toBeInTheDocument();
    });
});
