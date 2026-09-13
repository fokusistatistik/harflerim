'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { getTodaySummary, type TodayActivity } from '@/actions/todaySummary';

/**
 * Faz 2.8 — günlük rutin özeti. Sekiz yapraklı papatya metaforuyla (Faz
 * 1.9) bilerek örtüşen sekiz sabit etkinlik listesi — puan/sıralama/seri
 * yok, yalnızca sakin bir "bugün ne yaptım" özeti (anti-bağımlılık ilkesi).
 *
 * 2026-09-13 — UX denetiminde bulundu: bu panel önceden ana sayfada isim
 * başlığının hemen altında büyük, açık bir ızgara olarak duruyordu — bu bir
 * ikincil ilerleme özeti olduğu için ("rekabet/baskı yok" ilkesiyle çelişen
 * bir görsel ağırlık), artık varsayılan olarak KAPALI/küçük bir şerit,
 * dokununca detay ızgarası açılıyor.
 */
export function TodaySummary() {
    const [activities, setActivities] = useState<TodayActivity[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        getTodaySummary().then((result) => {
            setActivities(result);
            setLoaded(true);
        });
    }, []);

    if (!loaded || activities.length === 0) return null;

    const doneCount = activities.filter((a) => a.done).length;

    return (
        <div className="w-full bg-papatya-surface/70 backdrop-blur rounded-p-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-p-sm font-bold text-papatya-ink-soft"
            >
                <span>Bugün: {doneCount}/{activities.length} tamamlandı</span>
                <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3 p-4 pt-0">
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
            )}
        </div>
    );
}
