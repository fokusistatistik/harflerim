import { useEffect } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';

export function useActiveTimer() {
    const tick = useAnalyticsStore((state) => state.tick);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        const startTimer = () => {
            if (!interval) {
                interval = setInterval(() => {
                    if (document.visibilityState === 'visible') {
                        tick();
                    }
                }, 1000);
            }
        };

        const stopTimer = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };

        // Initial check
        if (document.visibilityState === 'visible') {
            startTimer();
        }

        // Listeners
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startTimer();
            } else {
                stopTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', startTimer);
        window.addEventListener('blur', stopTimer);

        return () => {
            stopTimer();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', startTimer);
            window.removeEventListener('blur', stopTimer);
        };
    }, [tick]);
}
