'use client';

import { useEffect, useState } from 'react';
import { listRecentAuditLog, type AuditLogEntry } from '@/actions/auditLogView';

/**
 * 2026-09-14 — kullanıcı isteğiyle ProgressTab'den ayrıldı: audit log
 * (giriş/PIN/ayar değişikliği gibi güvenlik/yönetim olayları) kavramsal
 * olarak çocuğun beceri ilerlemesinden farklı bir bilgi türü, ayrı bir
 * sekmede daha net.
 */
const EVENT_LABELS: Record<string, string> = {
    LOGIN_SUCCESS: 'Giriş yapıldı',
    LOGIN_FAILURE: 'Başarısız giriş denemesi',
    LOGOUT: 'Çıkış yapıldı',
    PARENT_GATE_UNLOCKED: 'Ebeveyn kilidi açıldı',
    PARENT_GATE_DENIED: 'Ebeveyn kilidi — yanlış PIN',
    PIN_CHANGED: 'PIN değiştirildi',
    SETTINGS_CHANGED: 'Ayar değiştirildi',
    CONTENT_ADDED: 'İçerik eklendi',
    CONTENT_REMOVED: 'İçerik kaldırıldı',
    FAMILY_MEMBER_ADDED: 'Aile bireyi eklendi',
    FAMILY_MEMBER_UPDATED: 'Aile bireyi güncellendi',
    FAMILY_MEMBER_REMOVED: 'Aile bireyi kaldırıldı',
    ACCOUNT_DELETION_REQUESTED: 'Hesap silme talep edildi',
    ACCOUNT_DELETION_COMPLETED: 'Hesap silindi',
};

export function AuditLogTab() {
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        listRecentAuditLog().then((result) => {
            if (!cancelled) {
                setAuditLog(result);
                setLoaded(true);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-p-sm text-papatya-ink-soft">
                Ebeveyn işlemleri ve güvenlik olayları — kim, ne zaman, ne yaptı.
            </p>
            {auditLog.length === 0 ? (
                <p className="text-p-sm text-papatya-ink-soft">Henüz bir kayıt yok.</p>
            ) : (
                <ul className="flex flex-col gap-1 max-h-[55vh] overflow-y-auto pr-1">
                    {auditLog.map((entry) => (
                        <li key={entry.id} className="flex items-center justify-between gap-2 text-p-sm bg-papatya-cream rounded-p-md px-3 py-2">
                            <span>
                                {EVENT_LABELS[entry.eventType] ?? entry.eventType}
                                {entry.detail && <span className="text-papatya-ink-soft"> — {entry.detail}</span>}
                            </span>
                            <span className="text-papatya-ink-soft whitespace-nowrap">
                                {new Date(entry.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
