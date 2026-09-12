'use client';

import { useState } from 'react';
import { Lock, X, LogOut } from 'lucide-react';
import { useParentGateStore } from '@/store/parentGateStore';
import { verifyParentPin, changeParentPin } from '@/actions/parentGate';
import { logout } from '@/actions/auth';

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 6);

/**
 * Faz 1.3/1.18 — ebeveyn kapısı. Header'daki logo/ana sayfa düğmesine uzun
 * basınca (veya NavGrid'deki "Ebeveyn Alanı" karosuna tıklayınca) açılır.
 * PIN doğrulama, PIN değiştirme ve çıkış (logout) burada; tam ebeveyn
 * yönetim paneli (aile bireyleri, içerik, ekran süresi vb.) Faz 2.1'i bekliyor.
 */
export function ParentGate() {
    const { isPinPromptOpen, isUnlocked, closePinPrompt, unlock, lock } = useParentGateStore();

    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [newPin2, setNewPin2] = useState('');
    const [changeError, setChangeError] = useState('');
    const [changeSuccess, setChangeSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!isPinPromptOpen && !isUnlocked) return null;

    const resetPinForm = () => {
        setPin('');
        setPinError('');
    };

    const resetChangeForm = () => {
        setCurrentPin('');
        setNewPin('');
        setNewPin2('');
        setChangeError('');
        setChangeSuccess(false);
    };

    const handleClose = () => {
        resetPinForm();
        closePinPrompt();
    };

    const handlePanelClose = () => {
        resetChangeForm();
        lock();
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setPinError('');
        const ok = await verifyParentPin(pin);
        setIsChecking(false);
        setPin('');
        if (ok) {
            unlock();
        } else {
            setPinError('Yanlış PIN. Tekrar deneyin.');
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout(); // redirect('/giris') içeride fırlatılır, burada yakalanmaz
    };

    const handleChangePin = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangeError('');
        setChangeSuccess(false);

        if (newPin !== newPin2) {
            setChangeError('Yeni PIN tekrarı eşleşmiyor.');
            return;
        }

        setIsSaving(true);
        const result = await changeParentPin(currentPin, newPin);
        setIsSaving(false);

        if (result.ok) {
            setChangeSuccess(true);
            setCurrentPin('');
            setNewPin('');
            setNewPin2('');
        } else {
            setChangeError(result.error ?? 'Bir hata oluştu.');
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-papatya-surface text-papatya-ink rounded-p-lg shadow-2xl w-full max-w-sm p-6 relative">
                <button
                    type="button"
                    onClick={isUnlocked ? handlePanelClose : handleClose}
                    className="absolute top-2 right-2 min-w-tap min-h-tap flex items-center justify-center text-papatya-ink-soft hover:text-papatya-ink transition-colors"
                    aria-label="Kapat"
                >
                    <X size={22} />
                </button>

                {!isUnlocked ? (
                    <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-4 pt-4">
                        <div className="p-3 bg-papatya-petal/20 rounded-full text-papatya-petal-deep">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-p-lg font-bold text-center">Ebeveyn Alanı</h2>
                        <p className="text-p-sm text-papatya-ink-soft text-center">
                            Devam etmek için ebeveyn PIN&apos;inizi girin.
                        </p>
                        <input
                            type="password"
                            inputMode="numeric"
                            autoFocus
                            autoComplete="off"
                            value={pin}
                            onChange={(e) => setPin(digitsOnly(e.target.value))}
                            className="w-full text-center text-2xl tracking-[0.5em] border-2 border-papatya-rule rounded-p-md py-3 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            placeholder="••••"
                        />
                        {pinError && <p className="text-p-sm text-papatya-rose">{pinError}</p>}
                        <button
                            type="submit"
                            disabled={isChecking || pin.length < 4}
                            className="w-full min-h-tap bg-papatya-petal text-papatya-ink font-bold rounded-p-md disabled:opacity-50"
                        >
                            {isChecking ? 'Kontrol ediliyor...' : 'Onayla'}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-5 pt-4">
                        <h2 className="text-p-lg font-bold text-center">Ebeveyn Yönetim Alanı</h2>

                        <form onSubmit={handleChangePin} className="flex flex-col gap-3 border-t border-papatya-rule pt-4">
                            <h3 className="text-p-base font-bold text-papatya-ink-soft">PIN Değiştir</h3>
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Mevcut PIN"
                                value={currentPin}
                                onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
                                className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Yeni PIN (4-6 hane)"
                                value={newPin}
                                onChange={(e) => setNewPin(digitsOnly(e.target.value))}
                                className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                            <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Yeni PIN (tekrar)"
                                value={newPin2}
                                onChange={(e) => setNewPin2(digitsOnly(e.target.value))}
                                className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky"
                            />
                            {changeError && <p className="text-p-sm text-papatya-rose">{changeError}</p>}
                            {changeSuccess && <p className="text-p-sm text-papatya-leaf">PIN güncellendi.</p>}
                            <button
                                type="submit"
                                disabled={isSaving || newPin.length < 4}
                                className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50"
                            >
                                {isSaving ? 'Kaydediliyor...' : 'Güncelle'}
                            </button>
                        </form>

                        <div className="border-t border-papatya-rule pt-4">
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full min-h-tap flex items-center justify-center gap-2 bg-papatya-rose/15 text-papatya-rose font-bold rounded-p-md disabled:opacity-50"
                            >
                                <LogOut size={18} />
                                {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                            </button>
                        </div>

                        {/* Faz 1.18: navigasyon iskeleti şimdilik ana sayfadaki NavGrid'de
                            (bkz. src/components/ui/NavGrid.tsx). Ebeveyn paneline özel
                            ayarlar linkleri Faz 2.1 panel yazıldıkça buraya eklenecek. */}
                    </div>
                )}
            </div>
        </div>
    );
}
