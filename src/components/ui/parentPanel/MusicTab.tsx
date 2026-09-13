'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { listSongs, addSong, updateSongLoopLimit, deleteSong, type SongData } from '@/actions/music';

const CHECKLIST_ITEMS = [
    'Videoda ani/yüksek ses yok',
    'Videoda yıpıcı/aşırı parlak görsel yok',
    'İçerik çocuğa uygun',
];

export function MusicTab() {
    const [songs, setSongs] = useState<SongData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [url, setUrl] = useState('');
    const [loopLimit, setLoopLimit] = useState(3);
    const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const refresh = () => {
        listSongs().then((result) => {
            setSongs(result);
            setLoaded(true);
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    const allChecked = checked.every(Boolean);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!allChecked) {
            setError('Devam etmeden önce kontrol listesindeki tüm maddeleri onaylayın.');
            return;
        }

        setIsSaving(true);
        const result = await addSong(url, loopLimit);
        setIsSaving(false);

        if (result.ok) {
            setUrl('');
            setLoopLimit(3);
            setChecked(CHECKLIST_ITEMS.map(() => false));
            refresh();
        } else {
            setError(result.error ?? 'Bir hata oluştu.');
        }
    };

    const handleDelete = async (id: string) => {
        await deleteSong(id);
        refresh();
    };

    const handleLoopLimitChange = async (id: string, value: number) => {
        if (!Number.isFinite(value) || value < 1 || value > 20) return;
        setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, dailyLoopLimit: value } : s)));
        await updateSongLoopLimit(id, value);
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {songs.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {songs.map((song) => (
                        <li key={song.id} className="flex items-center gap-3 bg-papatya-cream rounded-p-md p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={song.thumbnailUrl} alt={song.title} className="w-14 h-10 object-cover rounded-p-md" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-p-sm truncate">{song.title}</p>
                                <label className="flex items-center gap-1 text-p-sm text-papatya-ink-soft">
                                    Günlük {song.playsToday}/
                                    <input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={song.dailyLoopLimit}
                                        onChange={(e) => handleLoopLimitChange(song.id, Number(e.target.value))}
                                        aria-label={`${song.title} günlük tekrar hakkı`}
                                        className="w-14 border border-papatya-rule rounded-p-sm px-1 py-0.5 bg-papatya-surface text-center"
                                    />
                                    kez
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(song.id)}
                                className="min-w-tap min-h-tap flex items-center justify-center text-papatya-rose"
                                aria-label={`${song.title} kaydını sil`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-papatya-rule pt-3">
                <h3 className="text-p-base font-bold text-papatya-ink-soft">Yeni şarkı ekle</h3>
                <input
                    type="text"
                    placeholder="YouTube linki"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                />
                <label className="flex items-center justify-between gap-3">
                    <span className="text-p-sm text-papatya-ink-soft">Günlük tekrar hakkı</span>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={loopLimit}
                        onChange={(e) => setLoopLimit(Number(e.target.value))}
                        className="w-20 border-2 border-papatya-rule rounded-p-md px-2 py-1 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>

                <div className="flex flex-col gap-1 bg-papatya-petal/10 rounded-p-md p-3">
                    <p className="text-p-sm font-bold text-papatya-ink-soft">İçerik kontrol listesi</p>
                    {CHECKLIST_ITEMS.map((item, i) => (
                        <label key={item} className="flex items-center gap-2 text-p-sm">
                            <input
                                type="checkbox"
                                checked={checked[i]}
                                onChange={() =>
                                    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                                }
                                className="w-5 h-5 accent-papatya-sky"
                            />
                            {item}
                        </label>
                    ))}
                </div>

                {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
                <button
                    type="submit"
                    disabled={isSaving || !url}
                    className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
                >
                    {isSaving ? 'Ekleniyor...' : 'Ekle'}
                </button>
            </form>
        </div>
    );
}
