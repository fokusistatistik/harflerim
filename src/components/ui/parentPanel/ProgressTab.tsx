'use client';

import { useEffect, useState } from 'react';
import { getUsageStats, type UsageStats } from '@/actions/usageStats';
import { listBadges, type BadgeData } from '@/actions/badges';
import { getAllSkillProgress, type SkillProgressSummary } from '@/actions/skills';

function formatMinutes(seconds: number): string {
    return `${Math.round(seconds / 60)} dk`;
}

export function ProgressTab() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [skillProgress, setSkillProgress] = useState<SkillProgressSummary[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getUsageStats(), listBadges(), getAllSkillProgress()]).then(
            ([usageResult, badgeResult, skillResult]) => {
                if (!cancelled) {
                    setStats(usageResult);
                    setBadges(badgeResult);
                    setSkillProgress(skillResult);
                    setLoaded(true);
                }
            }
        );
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
                <p className="text-p-sm font-bold text-papatya-ink-soft mb-2">Beceri ilerlemesi</p>
                <p className="text-p-sm text-papatya-ink-soft mb-2">
                    Son 10 denemedeki başarı oranı — yorum içermez, sıralama/puan değildir.
                </p>
                {skillProgress.filter((s) => s.attemptCount > 0).length === 0 ? (
                    <p className="text-p-sm text-papatya-ink-soft">Henüz yeterli deneme yok.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {skillProgress
                            .filter((s) => s.attemptCount > 0)
                            .map((s) => (
                                <li key={s.skillKey} className="bg-papatya-cream rounded-p-md p-3">
                                    <div className="flex items-center justify-between text-p-sm mb-1">
                                        <span className="font-bold">{s.label}</span>
                                        <span className="text-papatya-ink-soft">
                                            {s.successRate !== null ? `%${Math.round(s.successRate * 100)}` : '—'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-papatya-rule/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-papatya-leaf rounded-full"
                                            style={{ width: `${Math.round((s.successRate ?? 0) * 100)}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
