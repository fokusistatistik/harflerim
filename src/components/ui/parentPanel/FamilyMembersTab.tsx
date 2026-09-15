'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Play, Pencil, X } from 'lucide-react';
import {
    listFamilyMembers,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    type FamilyMemberData,
} from '@/actions/familyMembers';
import { FAMILY_RELATIONS } from '@/config/familyRelations';

/** 2026-09-15 — fotoğraf/ses yükleme boyut sınırı (kullanıcı isteği, disk/DB şişmesini önler). Server tarafında da aynı sınır (bkz. familyMembers.ts) — client kontrolü yalnızca hızlı geri bildirim içindir. */
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

/**
 * Faz 2.2 — aile bireyleri kaydı. Ses kaydı tarayıcı MediaRecorder API'siyle
 * yapılır (Python/harici servis yok — bkz. Faz 2 kapsam sınırı notu); yalnızca
 * kısa bir örnek alınır, gerçek konuşmacı tanıma Faz 3.3'ün işidir.
 */
export function FamilyMembersTab() {
    const [members, setMembers] = useState<FamilyMemberData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingPhotoPath, setEditingPhotoPath] = useState<string | null>(null);
    const [editingVoicePath, setEditingVoicePath] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [customRelation, setCustomRelation] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // 2026-09-15 — kullanıcı bulgusu: dosya seçildiğinde ekranda yalnızca
    // dosya adı görünüyordu, gerçekten doğru/bozuk olmayan bir görsel mi
    // yüklendiği hiç belli değildi. `URL.createObjectURL` ile anında bir
    // küçük önizleme üretilir; obje URL'i bellek sızıntısı yapmasın diye
    // `photo` değiştiğinde bir önceki URL serbest bırakılır (cleanup).
    useEffect(() => {
        if (!photo) {
            setPhotoPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(photo);
        setPhotoPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photo]);

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

    const resetForm = () => {
        setEditingId(null);
        setEditingPhotoPath(null);
        setEditingVoicePath(null);
        setName('');
        setRelation('');
        setCustomRelation('');
        setPhoto(null);
        setVoiceBlob(null);
        setError('');
    };

    const startEdit = (member: FamilyMemberData) => {
        setEditingId(member.id);
        setEditingPhotoPath(member.photoPath);
        setEditingVoicePath(member.voicePath);
        setName(member.name);
        // Kayıtlı değer sabit listede varsa dropdown'da seçili gelir; yoksa
        // (eski serbest-metin kayıtları veya "Diğer" ile girilenler) "Diğer"
        // seçilip mevcut metin customRelation alanına taşınır.
        if ((FAMILY_RELATIONS as readonly string[]).includes(member.relation)) {
            setRelation(member.relation);
            setCustomRelation('');
        } else {
            setRelation('Diğer');
            setCustomRelation(member.relation);
        }
        setPhoto(null);
        setVoiceBlob(null);
        setError('');
    };

    const handlePhotoChange = (file: File | null) => {
        if (file && file.size > MAX_FILE_SIZE_BYTES) {
            setError('Seçilen fotoğraf 1 MB sınırını aşıyor, daha küçük bir dosya seçin.');
            return null;
        }
        setError('');
        return file;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!editingId && !photo) {
            setError('Bir fotoğraf seçin.');
            return;
        }

        const finalRelation = relation === 'Diğer' ? customRelation.trim() : relation;
        if (!finalRelation) {
            setError('Yakınlık derecesi gerekli.');
            return;
        }

        const fd = new FormData();
        fd.set('name', name);
        fd.set('relation', finalRelation);
        if (photo) fd.set('photo', photo);
        if (voiceBlob) fd.set('voice', new File([voiceBlob], 'ses.webm', { type: 'audio/webm' }));

        setIsSaving(true);
        const result = editingId ? await updateFamilyMember(editingId, fd) : await createFamilyMember(fd);
        setIsSaving(false);

        if (result.ok) {
            resetForm();
            refresh();
        } else {
            setError(result.error ?? 'Bir hata oluştu.');
        }
    };

    const handleDelete = async (id: string) => {
        await deleteFamilyMember(id);
        if (editingId === id) resetForm();
        refresh();
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-2">
                <h3 className="text-p-base font-bold text-papatya-ink-soft">Kayıtlı aile bireyleri</h3>
                {members.length > 0 ? (
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
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-p-sm truncate">{m.name}</p>
                                    <p className="text-p-sm text-papatya-ink-soft truncate">{m.relation}</p>
                                </div>
                                {m.voicePath && (
                                    <button
                                        type="button"
                                        onClick={() => new Audio(m.voicePath!).play()}
                                        className="min-w-tap min-h-tap flex items-center justify-center text-papatya-sky shrink-0"
                                        aria-label={`${m.name} sesini oynat`}
                                    >
                                        <Play size={16} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => startEdit(m)}
                                    className="min-w-tap min-h-tap flex items-center justify-center text-papatya-ink-soft shrink-0"
                                    aria-label={`${m.name} kaydını düzenle`}
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(m.id)}
                                    className="min-w-tap min-h-tap flex items-center justify-center text-papatya-rose shrink-0"
                                    aria-label={`${m.name} kaydını sil`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-p-sm text-papatya-ink-soft">Henüz aile bireyi eklenmedi.</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 lg:border-l lg:border-papatya-rule lg:pl-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-p-base font-bold text-papatya-ink-soft">
                        {editingId ? 'Aile bireyini düzenle' : 'Yeni aile bireyi ekle'}
                    </h3>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-1 text-p-sm text-papatya-ink-soft"
                        >
                            <X size={14} /> Vazgeç
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Ad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                    <select
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                        className="min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    >
                        <option value="" disabled>
                            Yakınlık derecesi seç
                        </option>
                        {FAMILY_RELATIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                {relation === 'Diğer' && (
                    <input
                        type="text"
                        placeholder="Yakınlık derecesi yazın (ör. Aile dostu)"
                        value={customRelation}
                        onChange={(e) => setCustomRelation(e.target.value)}
                        className="min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                )}
                <label className="flex flex-col gap-1">
                    {editingId && <span className="text-p-sm text-papatya-ink-soft">Yeni fotoğraf (boş bırakırsan mevcut kalır)</span>}
                    <div className="flex items-center gap-3">
                        {(photoPreviewUrl || editingPhotoPath) && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={photoPreviewUrl ?? editingPhotoPath ?? undefined}
                                alt="Seçilen fotoğraf önizlemesi"
                                className="w-14 h-14 rounded-p-md object-cover border-2 border-papatya-rule shrink-0"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(handlePhotoChange(e.target.files?.[0] ?? null))}
                            className="text-p-sm min-w-0"
                        />
                    </div>
                    <span className="text-p-sm text-papatya-ink-soft">En fazla 1 MB.</span>
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                    {!isRecording ? (
                        <button
                            type="button"
                            onClick={startRecording}
                            className="flex items-center gap-1 min-h-tap px-3 bg-papatya-leaf/20 text-papatya-leaf rounded-p-md text-p-sm font-bold"
                        >
                            <Mic size={16} /> {voiceBlob || editingVoicePath ? 'Yeniden kaydet' : 'İsteğe bağlı ses kaydı'}
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
                    {/* 2026-09-15 — kullanıcı isteği: düzenlerken mevcut sesi (varsa) dinleyebilme — kayıt listesindeki Play butonuyla aynı desen, yeni bir kayıt henüz alınmadıysa gösterilir. */}
                    {editingVoicePath && !voiceBlob && !isRecording && (
                        <button
                            type="button"
                            onClick={() => new Audio(editingVoicePath).play()}
                            className="flex items-center gap-1 min-h-tap px-3 bg-papatya-sky/15 text-papatya-sky rounded-p-md text-p-sm font-bold"
                        >
                            <Play size={16} /> Mevcut sesi dinle
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
                    {isSaving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </button>
            </form>
        </div>
    );
}
