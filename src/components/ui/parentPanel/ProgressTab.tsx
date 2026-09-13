'use client';

import { useEffect, useState } from 'react';
import { getUsageStats, type UsageStats } from '@/actions/usageStats';
import { listBadges, type BadgeData } from '@/actions/badges';
import { listRecentAuditLog, type AuditLogEntry } from '@/actions/auditLogView';

function formatMinutes(seconds: number): string {
    return `${Math.round(seconds / 60)} dk`;
}

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

export function ProgressTab() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getUsageStats(), listBadges(), listRecentAuditLog()]).then(([usageResult, badgeResult, auditResult]) => {
            if (!cancelled) {
                setStats(usageResult);
                setBadges(badgeResult);
                setAuditLog(auditResult);
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

    if (!stats) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Veri bulunamadı.</p>;
    }

    const rows = [
        { label: 'Bugün', value: formatMinutes(stats.todaySeconds) },
        { label: 'Toplam', value: formatMinutes(stats.totalSeconds) },
        { label: 'Günlük ortalama', value: formatMinutes(stats.averageSecondsPerDay) },
        { label: 'Kayıtlı gün sayısı', value: `${stats.daysTracked}` },
    ];

    return (
        <div className="flex flex-col gap-3">
            <p className="text-p-sm text-papatya-ink-soft">
                Yalnızca sana görünür — çocuğun ekranda geçirdiği süreye dair nötr bir özet, bir başarı ölçüsü değil.
            </p>
            <dl className="grid grid-cols-2 gap-3">
                {rows.map((row) => (
                    <div key={row.label} className="bg-papatya-cream rounded-p-md p-3">
                        <dt className="text-p-sm text-papatya-ink-soft">{row.label}</dt>
                        <dd className="text-p-lg font-bold">{row.value}</dd>
                    </div>
                ))}
            </dl>

            <div className="border-t border-papatya-rule pt-3">
                <p className="text-p-sm font-bold text-papatya-ink-soft mb-2">
                    Kazanılan rozetler ({badges.length})
                </p>
                {badges.length === 0 ? (
                    <p className="text-p-sm text-papatya-ink-soft">Henüz rozet kazanılmadı.</p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {badges.map((badge) => (
                            <li
                                key={badge.id}
                                title={new Date(badge.earnedAt).toLocaleDateString('tr-TR')}
                                className="flex items-center gap-1 bg-papatya-cream rounded-p-md px-3 py-2 text-p-sm font-bold"
                            >
                                <span className="text-p-lg" aria-hidden="true">{badge.emoji}</span>
                                {badge.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="border-t border-papatya-rule pt-3">
                <p className="text-p-sm font-bold text-papatya-ink-soft mb-2">Son değişiklikler</p>
                {auditLog.length === 0 ? (
                    <p className="text-p-sm text-papatya-ink-soft">Henüz bir kayıt yok.</p>
                ) : (
                    <ul className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto pr-1">
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
        </div>
    );
}
