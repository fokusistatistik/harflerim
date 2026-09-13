'use client';

import { useEffect, useState } from 'react';
import { getUsageStats, type UsageStats } from '@/actions/usageStats';

function formatMinutes(seconds: number): string {
    return `${Math.round(seconds / 60)} dk`;
}

export function ProgressTab() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getUsageStats().then((result) => {
            if (!cancelled) {
                setStats(result);
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
        </div>
    );
}
