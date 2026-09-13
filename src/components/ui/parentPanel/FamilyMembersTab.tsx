'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Play } from 'lucide-react';
import {
    listFamilyMembers,
    createFamilyMember,
    deleteFamilyMember,
    type FamilyMemberData,
} from '@/actions/familyMembers';

/**
 * Faz 2.2 — aile bireyleri kaydı. Ses kaydı tarayıcı MediaRecorder API'siyle
 * yapılır (Python/harici servis yok — bkz. Faz 2 kapsam sınırı notu); yalnızca
 * kısa bir örnek alınır, gerçek konuşmacı tanıma Faz 3.3'ün işidir.
 */
export function FamilyMembersTab() {
    const [members, setMembers] = useState<FamilyMemberData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const refresh = () => {
        listFamilyMembers().then((result) => {
            setMembers(result);
            setLoaded(true);
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];
            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = () => {
                setVoiceBlob(new Blob(chunksRef.current, { type: 'audio/webm' }));
                stream.getTracks().forEach((track) => track.stop());
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch {
            setError('Mikrofona erişilemedi.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!photo) {
            setError('Bir fotoğraf seçin.');
            return;
        }

        const fd = new FormData();
        fd.set('name', name);
        fd.set('relation', relation);
        fd.set('photo', photo);
        if (voiceBlob) fd.set('voice', new File([voiceBlob], 'ses.webm', { type: 'audio/webm' }));

        setIsSaving(true);
        const result = await createFamilyMember(fd);
        setIsSaving(false);

        if (result.ok) {
            setName('');
            setRelation('');
            setPhoto(null);
            setVoiceBlob(null);
            refresh();
        } else {
            setError(result.error ?? 'Bir hata oluştu.');
        }
    };

    const handleDelete = async (id: string) => {
        await deleteFamilyMember(id);
        refresh();
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            {members.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {members.map((m) => (
                        <li
                            key={m.id}
                            className="flex items-center gap-3 bg-papatya-cream rounded-p-md p-2"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={m.photoPath}
                                alt={m.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-bold text-p-sm">{m.name}</p>
                                <p className="text-p-sm text-papatya-ink-soft">{m.relation}</p>
                            </div>
                            {m.voicePath && (
                                <button
                                    type="button"
                                    onClick={() => new Audio(m.voicePath!).play()}
                                    className="min-w-tap min-h-tap flex items-center justify-center text-papatya-sky"
                                    aria-label={`${m.name} sesini oynat`}
                                >
                                    <Play size={16} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDelete(m.id)}
                                className="min-w-tap min-h-tap flex items-center justify-center text-papatya-rose"
                                aria-label={`${m.name} kaydını sil`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-papatya-rule pt-3">
                <h3 className="text-p-base font-bold text-papatya-ink-soft">Yeni aile bireyi ekle</h3>
                <input
                    type="text"
                    placeholder="Ad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                />
                <input
                    type="text"
                    placeholder="Yakınlık derecesi (ör. Anne, Baba, Abla)"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                    className="text-p-sm"
                />

                <div className="flex items-center gap-2">
                    {!isRecording ? (
                        <button
                            type="button"
                            onClick={startRecording}
                            className="flex items-center gap-1 min-h-tap px-3 bg-papatya-leaf/20 text-papatya-leaf rounded-p-md text-p-sm font-bold"
                        >
                            <Mic size={16} /> {voiceBlob ? 'Yeniden kaydet' : 'İsteğe bağlı ses kaydı'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="flex items-center gap-1 min-h-tap px-3 bg-papatya-rose/20 text-papatya-rose rounded-p-md text-p-sm font-bold"
                        >
                            <Square size={16} /> Kaydı durdur
                        </button>
                    )}
                    {voiceBlob && !isRecording && <span className="text-p-sm text-papatya-leaf">Ses kaydedildi ✓</span>}
                </div>

                {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
                <button
                    type="submit"
                    disabled={isSaving}
                    className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
                >
                    {isSaving ? 'Kaydediliyor...' : 'Ekle'}
                </button>
            </form>
        </div>
    );
}
