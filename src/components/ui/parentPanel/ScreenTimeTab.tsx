'use client';

import { useEffect, useState } from 'react';
import { getParentPreferences, updateScreenTimeLimit, updateLetterHuntLimit, updateMemoryMatchLimit, updateVisualMatchLimit } from '@/actions/parentSettings';

export function ScreenTimeTab() {
    const [minutes, setMinutes] = useState(30);
    const [letterHuntLimit, setLetterHuntLimit] = useState(100);
    const [memoryMatchLimit, setMemoryMatchLimit] = useState(20);
    const [visualMatchLimit, setVisualMatchLimit] = useState(20);
    const [loaded, setLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        getParentPreferences().then((prefs) => {
            if (!cancelled && prefs) {
                setMinutes(prefs.dailyScreenLimitMinutes);
                setLetterHuntLimit(prefs.dailyLetterHuntLimit);
                setMemoryMatchLimit(prefs.dailyMemoryMatchLimit);
                setVisualMatchLimit(prefs.dailyVisualMatchLimit);
                setLoaded(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaved(false);
        setIsSaving(true);
        const [screenResult, letterHuntResult, memoryMatchResult, visualMatchResult] = await Promise.all([
            updateScreenTimeLimit(minutes),
            updateLetterHuntLimit(letterHuntLimit),
            updateMemoryMatchLimit(memoryMatchLimit),
            updateVisualMatchLimit(visualMatchLimit),
        ]);
        setIsSaving(false);
        if (screenResult.ok && letterHuntResult.ok && memoryMatchResult.ok && visualMatchResult.ok) {
            setSaved(true);
        } else {
            setError(screenResult.error ?? letterHuntResult.error ?? memoryMatchResult.error ?? visualMatchResult.error ?? 'Bir hata oluştu.');
        }
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <label className="flex flex-col gap-1">
                    <span className="text-p-sm text-papatya-ink-soft">Günlük ekran süresi (dakika)</span>
                    <input
                        id="daily-limit"
                        type="number"
                        min={10}
                        max={240}
                        step={5}
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-p-sm text-papatya-ink-soft">Harf Avı günlük tur limiti</span>
                    <input
                        id="letter-hunt-limit"
                        type="number"
                        min={25}
                        max={250}
                        step={5}
                        value={letterHuntLimit}
                        onChange={(e) => setLetterHuntLimit(Number(e.target.value))}
                        className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-p-sm text-papatya-ink-soft">Hafıza Kartları günlük tur limiti</span>
                    <input
                        id="memory-match-limit"
                        type="number"
                        min={10}
                        max={50}
                        step={5}
                        value={memoryMatchLimit}
                        onChange={(e) => setMemoryMatchLimit(Number(e.target.value))}
                        className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-p-sm text-papatya-ink-soft">Gölge Eşleştirme günlük tur limiti</span>
                    <input
                        id="visual-match-limit"
                        type="number"
                        min={10}
                        max={50}
                        step={5}
                        value={visualMatchLimit}
                        onChange={(e) => setVisualMatchLimit(Number(e.target.value))}
                        className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                    />
                </label>
            </div>
            <button
                type="submit"
                disabled={isSaving}
                className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50 self-start px-6"
            >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
            {saved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
        </form>
    );
}
