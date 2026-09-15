'use client';

import { useState } from 'react';
import { Lock, X, LogOut, Clock, Sparkles, HeartPulse, LineChart, Users, Music, Film, Palette, ScrollText } from 'lucide-react';
import { useParentGateStore } from '@/store/parentGateStore';
import { verifyParentPin, changeParentPin } from '@/actions/parentGate';
import { logout } from '@/actions/auth';
import { ScreenTimeTab } from './parentPanel/ScreenTimeTab';
import { SensoryTab } from './parentPanel/SensoryTab';
import { ChildProfileTab } from './parentPanel/ChildProfileTab';
import { ProgressTab } from './parentPanel/ProgressTab';
import { FamilyMembersTab } from './parentPanel/FamilyMembersTab';
import { MusicTab } from './parentPanel/MusicTab';
import { CartoonTab } from './parentPanel/CartoonTab';
import { DrawingsTab } from './parentPanel/DrawingsTab';
import { IdentitySection } from './parentPanel/IdentitySection';
import { AuditLogTab } from './parentPanel/AuditLogTab';

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 6);

/**
 * Faz 2.1 — Ebeveyn Yönetim Alanı'nın sekmeleri. Yeni bir özellik eklendikçe
 * bu diziye bir madde daha eklenir — panelin kendisi yeniden yazılmaz.
 */
const TABS = [
    { key: 'genel', label: 'Genel', icon: Lock },
    { key: 'aile', label: 'Aile', icon: Users },
    { key: 'muzik', label: 'Müzik', icon: Music },
    { key: 'video', label: 'Videolar', icon: Film },
    { key: 'cizimler', label: 'Çizimler', icon: Palette },
    { key: 'profil', label: 'Profil', icon: Sparkles },
    { key: 'duyusal', label: 'Duyusal', icon: HeartPulse },
    { key: 'sure', label: 'Süre', icon: Clock },
    { key: 'ilerleme', label: 'İlerleme', icon: LineChart },
    { key: 'kayitlar', label: 'Kayıtlar', icon: ScrollText },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * Faz 1.3/1.18 — ebeveyn kapısı. Header'daki logo/ana sayfa düğmesine uzun
 * basınca (veya NavGrid'deki "Ebeveyn Alanı" karosuna tıklayınca) açılır.
 * PIN doğrulama burada; kilit açıldıktan sonraki tam yönetim alanı Faz 2.1
 * ile sekmeli hale geldi (bkz. TABS).
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
    const [activeTab, setActiveTab] = useState<TabKey>('genel');

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
        setActiveTab('genel');
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
            <div
                className={`bg-papatya-surface text-papatya-ink rounded-p-lg shadow-2xl w-full p-4 sm:p-6 relative ${
                    isUnlocked ? 'max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto' : 'max-w-sm'
                }`}
            >
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
                    <div className="flex flex-col gap-3 pt-2 sm:pt-4">
                        <h2 className="text-p-lg font-bold text-center">Ebeveyn Yönetim Alanı</h2>

                        <div className="flex flex-wrap gap-1 border-b border-papatya-rule pb-2" role="tablist">
                            {TABS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-p-md text-p-sm font-bold whitespace-nowrap transition-colors ${
                                        activeTab === key
                                            ? 'bg-papatya-sky text-white'
                                            : 'text-papatya-ink-soft hover:bg-papatya-cream'
                                    }`}
                                >
                                    <Icon size={15} className="shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[200px]">
                            {activeTab === 'genel' && (
                                <div className="flex flex-col gap-5">
                                    <IdentitySection />

                                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 border-t border-papatya-rule pt-4">
                                        <form onSubmit={handleChangePin} className="flex flex-col gap-2">
                                            <h3 className="text-p-base font-bold text-papatya-ink-soft">PIN Değiştir</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    placeholder="Mevcut PIN"
                                                    value={currentPin}
                                                    onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
                                                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                                                />
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    placeholder="Yeni PIN"
                                                    value={newPin}
                                                    onChange={(e) => setNewPin(digitsOnly(e.target.value))}
                                                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                                                />
                                                <input
                                                    type="password"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    placeholder="Yeni PIN (tekrar)"
                                                    value={newPin2}
                                                    onChange={(e) => setNewPin2(digitsOnly(e.target.value))}
                                                    className="border-2 border-papatya-rule rounded-p-md px-3 py-2 bg-papatya-cream focus:outline-none focus:border-papatya-sky min-w-0"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSaving || newPin.length < 4}
                                                    className="min-h-tap bg-papatya-sky text-white font-bold rounded-p-md disabled:opacity-50 px-6 whitespace-nowrap"
                                                >
                                                    {isSaving ? 'Kaydediliyor...' : 'Güncelle'}
                                                </button>
                                            </div>
                                            <p className="text-p-sm text-papatya-ink-soft">4-6 hane.</p>
                                            {changeError && <p className="text-p-sm text-papatya-rose">{changeError}</p>}
                                            {changeSuccess && <p className="text-p-sm text-papatya-leaf">PIN güncellendi.</p>}
                                        </form>

                                        <div className="flex flex-col lg:border-l lg:border-papatya-rule lg:pl-6">
                                            <h3 className="text-p-base font-bold text-papatya-ink-soft mb-2">Oturum</h3>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                disabled={isLoggingOut}
                                                className="min-h-tap flex items-center justify-center gap-2 bg-papatya-rose/15 text-papatya-rose font-bold rounded-p-md disabled:opacity-50 px-6"
                                            >
                                                <LogOut size={18} />
                                                {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'aile' && <FamilyMembersTab />}
                            {activeTab === 'muzik' && <MusicTab />}
                            {activeTab === 'video' && <CartoonTab />}
                            {activeTab === 'cizimler' && <DrawingsTab />}
                            {activeTab === 'profil' && <ChildProfileTab />}
                            {activeTab === 'duyusal' && <SensoryTab />}
                            {activeTab === 'sure' && <ScreenTimeTab />}
                            {activeTab === 'ilerleme' && <ProgressTab />}
                            {activeTab === 'kayitlar' && <AuditLogTab />}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
