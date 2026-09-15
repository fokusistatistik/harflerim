'use client';

import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, Camera } from 'lucide-react';
import { getIdentity, updateIdentity, updateUsername, updateAvatar } from '@/actions/identity';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

/**
 * 2026-09-13 — UX denetiminde bulundu: profil fotoğrafı tıklanamıyordu ve
 * ad/soyad hiçbir yerden değiştirilemiyordu (ana sayfadaki isim her zaman
 * kayıt sırasında girilen değerde sabit kalıyordu). Genel sekmesinin en
 * üstüne eklendi — PIN değiştirmeden önce, kimlik en temel ayar olduğu için.
 */
export function IdentitySection() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        getIdentity().then((result) => {
            if (!cancelled && result) {
                setFirstName(result.firstName);
                setLastName(result.lastName);
                setUsername(result.username);
                setAvatarUrl(result.avatarUrl);
                setLoaded(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError('');
        setIsUploadingAvatar(true);
        const fd = new FormData();
        fd.set('avatar', file);
        const result = await updateAvatar(fd);
        setIsUploadingAvatar(false);
        if (result.ok && result.avatarUrl) {
            setAvatarUrl(result.avatarUrl);
        } else {
            setError(result.error ?? 'Fotoğraf yüklenemedi.');
        }
        e.target.value = '';
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaved(false);
        setIsSaving(true);
        const [nameResult, usernameResult] = await Promise.all([
            updateIdentity(firstName, lastName),
            updateUsername(username),
        ]);
        setIsSaving(false);
        if (nameResult.ok && usernameResult.ok) {
            setSaved(true);
        } else {
            setError(nameResult.error ?? usernameResult.error ?? 'Bir hata oluştu.');
        }
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-4">Yükleniyor...</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-p-base font-bold text-papatya-ink-soft">Kimlik</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarPick}
                />
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="relative w-36 h-36 rounded-full shrink-0 group self-start lg:self-auto"
                        aria-label="Profil fotoğrafını değiştir"
                        title="Profil fotoğrafını değiştir"
                    >
                        {avatarUrl ? (
                            <ImageWithFallback
                                src={avatarUrl}
                                alt={firstName}
                                className="w-36 h-36 rounded-full object-cover border-2 border-papatya-rule"
                                fallback={
                                    <div className="w-36 h-36 rounded-full border-2 border-papatya-rule bg-papatya-petal/20 flex items-center justify-center">
                                        <UserIcon className="text-papatya-petal-deep" size={60} />
                                    </div>
                                }
                            />
                        ) : (
                            <div className="w-36 h-36 rounded-full border-2 border-papatya-rule bg-papatya-petal/20 flex items-center justify-center">
                                <UserIcon className="text-papatya-petal-deep" size={60} />
                            </div>
                        )}
                        <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                            <Camera size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                    </button>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                        <label className="flex flex-col gap-1 min-w-0">
                            <span className="text-p-sm text-papatya-ink-soft">Ad</span>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                        </label>
                        <label className="flex flex-col gap-1 min-w-0">
                            <span className="text-p-sm text-papatya-ink-soft">Soyad</span>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                        </label>
                        <label className="flex flex-col gap-1 min-w-0">
                            <span className="text-p-sm text-papatya-ink-soft">Kullanıcı adı</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isSaving || !firstName.trim() || username.trim().length < 2}
                            className="bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50 px-6 py-2 whitespace-nowrap"
                        >
                            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
                {isUploadingAvatar && <p className="text-p-sm text-papatya-ink-soft">Fotoğraf yükleniyor...</p>}
                <p className="text-p-sm text-papatya-ink-soft">
                    Kullanıcı adı giriş ekranında kullanılır. Değiştirirsen bir sonraki girişte yeni kullanıcı adını kullanman gerekir.
                </p>
                {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
                {saved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
            </form>
        </div>
    );
}
