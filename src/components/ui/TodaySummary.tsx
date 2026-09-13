'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { getTodaySummary, type TodayActivity } from '@/actions/todaySummary';

/**
 * Faz 2.8 — günlük rutin özeti. Sekiz yapraklı papatya metaforuyla (Faz
 * 1.9) bilerek örtüşen sekiz sabit etkinlik listesi — puan/sıralama/seri
 * yok, yalnızca sakin bir "bugün ne yaptım" özeti (anti-bağımlılık ilkesi).
 */
export function TodaySummary() {
    const [activities, setActivities] = useState<TodayActivity[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getTodaySummary().then((result) => {
            setActivities(result);
            setLoaded(true);
        });
    }, []);

    if (!loaded || activities.length === 0) return null;

    return (
        <div className="w-full max-w-2xl bg-papatya-surface/70 backdrop-blur rounded-p-lg p-4 flex flex-col gap-3">
            <h2 className="text-p-base font-bold text-papatya-ink-soft text-center">Bugün</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className={`flex items-center gap-2 rounded-p-md px-3 py-2 text-p-sm font-bold ${
                            activity.done
                                ? 'bg-papatya-leaf/20 text-papatya-leaf'
                                : 'bg-papatya-cream text-papatya-ink-soft'
                        }`}
                    >
                        <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                activity.done ? 'bg-papatya-leaf text-white' : 'bg-papatya-rule/50'
                            }`}
                        >
                            {activity.done && <Check size={14} />}
                        </span>
                        <span className="truncate">{activity.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
