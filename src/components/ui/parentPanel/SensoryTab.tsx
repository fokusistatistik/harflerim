'use client';

import { useEffect, useState } from 'react';
import { getParentPreferences, updateSensoryToggles, type ParentPreferences } from '@/actions/parentSettings';

const TOGGLES: { key: keyof Omit<ParentPreferences, 'dailyScreenLimitMinutes' | 'dailyLetterHuntLimit' | 'dailyMemoryMatchLimit'>; label: string }[] = [
    { key: 'reduceMotion', label: 'Hareketi azalt' },
    { key: 'highContrast', label: 'Yüksek kontrast' },
    { key: 'speechEnabled', label: 'Sesli okuma' },
    { key: 'cameraEnabled', label: 'Kamera (varsayılan kapalı önerilir)' },
];

export function SensoryTab() {
    const [prefs, setPrefs] = useState<ParentPreferences | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getParentPreferences().then((result) => {
            if (!cancelled) setPrefs(result);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!prefs) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    const handleToggle = async (key: keyof Omit<ParentPreferences, 'dailyScreenLimitMinutes' | 'dailyLetterHuntLimit' | 'dailyMemoryMatchLimit'>) => {
        const next = { ...prefs, [key]: !prefs[key] };
        setPrefs(next);
        setSaved(false);
        const result = await updateSensoryToggles({ [key]: next[key] });
        if (result.ok) setSaved(true);
    };

    return (
        <div className="flex flex-col gap-3 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOGGLES.map((toggle) => (
                    <label
                        key={toggle.key}
                        className="flex items-center justify-between gap-3 min-h-tap px-3 py-2 bg-papatya-cream rounded-p-md"
                    >
                        <span className="text-p-base">{toggle.label}</span>
                        <input
                            type="checkbox"
                            checked={prefs[toggle.key]}
                            onChange={() => handleToggle(toggle.key)}
                            className="w-6 h-6 accent-papatya-sky shrink-0"
                        />
                    </label>
                ))}
            </div>
            {saved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
        </div>
    );
}
