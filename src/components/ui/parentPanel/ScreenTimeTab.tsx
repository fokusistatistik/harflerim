'use client';

import { useEffect, useState } from 'react';
import { getParentPreferences, updateScreenTimeLimit } from '@/actions/parentSettings';

export function ScreenTimeTab() {
    const [minutes, setMinutes] = useState(30);
    const [loaded, setLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        getParentPreferences().then((prefs) => {
            if (!cancelled && prefs) {
                setMinutes(prefs.dailyScreenLimitMinutes);
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
        const result = await updateScreenTimeLimit(minutes);
        setIsSaving(false);
        if (result.ok) {
            setSaved(true);
        } else {
            setError(result.error ?? 'Bir hata oluştu.');
        }
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
            <label className="text-p-sm text-papatya-ink-soft" htmlFor="daily-limit">
                Günlük ekran süresi limiti (dakika)
            </label>
            <input
                id="daily-limit"
                type="number"
                min={5}
                max={480}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
            />
            {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
            {saved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
            <button
                type="submit"
                disabled={isSaving}
                className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
            >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
        </form>
    );
}
