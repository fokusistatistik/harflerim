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
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);
    const [usernameSaved, setUsernameSaved] = useState(false);
    const [usernameError, setUsernameError] = useState('');
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

    const handleNameSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setNameSaved(false);
        setIsSavingName(true);
        const result = await updateIdentity(firstName, lastName);
        setIsSavingName(false);
        if (result.ok) {
            setNameSaved(true);
        } else {
            setError(result.error ?? 'Bir hata oluştu.');
        }
    };

    const handleUsernameSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameError('');
        setUsernameSaved(false);
        setIsSavingUsername(true);
        const result = await updateUsername(username);
        setIsSavingUsername(false);
        if (result.ok) {
            setUsernameSaved(true);
        } else {
            setUsernameError(result.error ?? 'Bir hata oluştu.');
        }
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-4">Yükleniyor...</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-p-base font-bold text-papatya-ink-soft">Kimlik</h3>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="relative w-28 h-28 rounded-full shrink-0 group"
                    aria-label="Profil fotoğrafını değiştir"
                    title="Profil fotoğrafını değiştir"
                >
                    {avatarUrl ? (
                        <ImageWithFallback
                            src={avatarUrl}
                            alt={firstName}
                            className="w-28 h-28 rounded-full object-cover border-2 border-papatya-rule"
                            fallback={
                                <div className="w-28 h-28 rounded-full border-2 border-papatya-rule bg-papatya-petal/20 flex items-center justify-center">
                                    <UserIcon className="text-papatya-petal-deep" size={48} />
                                </div>
                            }
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full border-2 border-papatya-rule bg-papatya-petal/20 flex items-center justify-center">
                            <UserIcon className="text-papatya-petal-deep" size={48} />
                        </div>
                    )}
                    <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                        <Camera size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarPick}
                />
                <p className="text-p-sm text-papatya-ink-soft">
                    {isUploadingAvatar ? 'Yükleniyor...' : 'Değiştirmek için fotoğrafa dokun.'}
                </p>
            </div>

            <form onSubmit={handleNameSave} className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                {error && <p className="text-p-sm text-papatya-rose">{error}</p>}
                {nameSaved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
                <button
                    type="submit"
                    disabled={isSavingName || !firstName.trim()}
                    className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
                >
                    {isSavingName ? 'Kaydediliyor...' : 'İsmi Güncelle'}
                </button>
            </form>

            <form onSubmit={handleUsernameSave} className="flex flex-col gap-1.5 border-t border-papatya-rule pt-3">
                <label className="flex flex-col gap-1">
                    <span className="text-p-sm text-papatya-ink-soft">Kullanıcı adı (giriş ekranında kullanılır)</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full min-w-0 border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                    />
                </label>
                <p className="text-p-sm text-papatya-rose">
                    Değiştirirsen bir sonraki girişte yeni kullanıcı adını kullanman gerekir.
                </p>
                {usernameError && <p className="text-p-sm text-papatya-rose">{usernameError}</p>}
                {usernameSaved && <p className="text-p-sm text-papatya-leaf">Kaydedildi.</p>}
                <button
                    type="submit"
                    disabled={isSavingUsername || username.trim().length < 2}
                    className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
                >
                    {isSavingUsername ? 'Kaydediliyor...' : 'Kullanıcı Adını Güncelle'}
                </button>
            </form>
        </div>
    );
}
