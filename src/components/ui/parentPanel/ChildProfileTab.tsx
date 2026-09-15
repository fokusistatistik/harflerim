'use client';

import { useEffect, useState } from 'react';
import { getChildProfile, updateChildProfile, type ChildProfileData } from '@/actions/childProfile';
import {
    LEARNING_CHANNELS,
    COMMUNICATION_LEVELS,
    SENSITIVITY_LEVELS,
    type SensitivityLevel,
} from '@/lib/childProfile';

const LEARNING_LABELS: Record<string, string> = {
    reading: 'Okuyarak',
    listening: 'Dinleyerek',
    visual: 'Görsel',
};

const COMMUNICATION_LABELS: Record<string, string> = {
    verbal: 'Sözel',
    aac: 'AAC / simge',
    mixed: 'Karma',
};

const SENSORY_LABELS: Record<string, string> = { sound: 'Ses', light: 'Işık', touch: 'Dokunma' };

function listToText(list: string[]): string {
    return list.join(', ');
}

function textToList(text: string): string[] {
    return text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

const EMPTY: ChildProfileData = {
    age: null,
    gender: '',
    favoriteColor: '',
    interests: [],
    learningChannel: '',
    sensoryProfile: {},
    triggers: [],
    calmers: [],
    communicationLevel: '',
};

export function ChildProfileTab() {
    const [data, setData] = useState<ChildProfileData>(EMPTY);
    const [loaded, setLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        getChildProfile().then((result) => {
            if (!cancelled && result) {
                setData(result);
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
        const result = await updateChildProfile(data);
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
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-p-sm text-papatya-ink-soft">
                Bu bilgiler bir tanı aracı değildir; yalnızca kişiselleştirme içindir. Hiçbir alan zorunlu değil.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Yaş</span>
                    <input
                        type="number"
                        min={0}
                        max={25}
                        value={data.age ?? ''}
                        onChange={(e) => setData({ ...data, age: e.target.value === '' ? null : Number(e.target.value) })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Favori renk</span>
                    <input
                        type="text"
                        value={data.favoriteColor}
                        onChange={(e) => setData({ ...data, favoriteColor: e.target.value })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Öğrenme kanalı</span>
                    <select
                        value={data.learningChannel}
                        onChange={(e) => setData({ ...data, learningChannel: e.target.value })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    >
                        <option value="">Belirtilmedi</option>
                        {LEARNING_CHANNELS.map((c) => (
                            <option key={c} value={c}>{LEARNING_LABELS[c]}</option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">İletişim düzeyi</span>
                    <select
                        value={data.communicationLevel}
                        onChange={(e) => setData({ ...data, communicationLevel: e.target.value })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    >
                        <option value="">Belirtilmedi</option>
                        {COMMUNICATION_LEVELS.map((c) => (
                            <option key={c} value={c}>{COMMUNICATION_LABELS[c]}</option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">İlgi alanları (virgülle ayır)</span>
                    <input
                        type="text"
                        placeholder="kedi, gezegenler, dinozorlar"
                        value={listToText(data.interests)}
                        onChange={(e) => setData({ ...data, interests: textToList(e.target.value) })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
                <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Duyusal hassasiyet</span>
                    <div className="grid grid-cols-3 gap-2">
                        {(['sound', 'light', 'touch'] as const).map((dim) => (
                            <label key={dim} className="flex flex-col gap-1 min-w-0">
                                <span className="text-p-sm">{SENSORY_LABELS[dim]}</span>
                                <select
                                    value={data.sensoryProfile[dim] ?? ''}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            sensoryProfile: {
                                                ...data.sensoryProfile,
                                                [dim]: (e.target.value || undefined) as SensitivityLevel | undefined,
                                            },
                                        })
                                    }
                                    className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-1 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky text-p-sm"
                                >
                                    <option value="">—</option>
                                    {SENSITIVITY_LEVELS.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Tetikleyiciler (virgülle ayır)</span>
                    <input
                        type="text"
                        value={listToText(data.triggers)}
                        onChange={(e) => setData({ ...data, triggers: textToList(e.target.value) })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                    <span className="text-p-sm text-papatya-ink-soft">Sakinleştiriciler (virgülle ayır)</span>
                    <input
                        type="text"
                        value={listToText(data.calmers)}
                        onChange={(e) => setData({ ...data, calmers: textToList(e.target.value) })}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
            </div>

            {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
            {saved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
            <button
                type="submit"
                disabled={isSaving}
                className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50 self-start px-6"
            >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
        </form>
    );
}
