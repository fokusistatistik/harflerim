'use client';

import React, { useState, useEffect } from 'react';
import { useLevelStore } from '@/store/levelStore';
import { Moon, Sun, Lock, Timer } from 'lucide-react';
import Link from 'next/link';
import { useLongPress } from '@/hooks/useLongPress';
import { useParentGateStore } from '@/store/parentGateStore';
import { DaisyProgress } from '@/components/ui/DaisyProgress';
import { getTodaySummary } from '@/actions/todaySummary';

const TOTAL_PETALS = 8;

export function Header() {
    const { isDayComplete, dailyScreenSeconds, dailyScreenLimit } = useLevelStore();
    // 2026-09-14 — kullanıcı bulgusu: "3/8 tamamlandı" yazıyor ama sadece 1
    // yaprak doluydu. Kök neden: bu gösterge Faz 1.9'un geçici zaman-oranı
    // hesabını (dailyScreenSeconds/dailyScreenLimit) kullanıyordu, Faz 2.8'in
    // gerçek "günün sekiz etkinliği" mantığına (bkz. TodaySummary.tsx,
    // getTodaySummary) hiç bağlanmamıştı — iki gösterge aynı papatya
    // metaforunu paylaşıyordu ama birbirinden bağımsızdı. Artık aynı kaynağı
    // okuyor: kaç etkinlik "yapıldı" işaretliyse o kadar yaprak dolu.
    const [doneCount, setDoneCount] = useState(0);
    useEffect(() => {
        let cancelled = false;
        getTodaySummary().then((activities) => {
            if (!cancelled) setDoneCount(activities.filter((a) => a.done).length);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const filledPetals = Math.max(0, Math.min(TOTAL_PETALS, doneCount));
    const openPinPrompt = useParentGateStore((s) => s.openPinPrompt);
    const longPress = useLongPress(openPinPrompt);
    const [time, setTime] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
            setDateStr(now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // 2026-09-14 — ayrı bir sabit ParentFooter alt çubuğu kaldırıldı (kullanıcı
    // isteği: "ekstra bir footer alanı olmasın"), süre/kilit bilgisi buraya
    // taşındı. dailyScreenSeconds client-only store'dan geldiği için `mounted`
    // olmadan gösterilirse hydration mismatch riski var — time/dateStr'deki
    // ile aynı desen.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const usedMin = Math.floor(dailyScreenSeconds / 60);
    const limitMin = Math.round(dailyScreenLimit / 60);

    return (
        <header className="fixed top-0 left-0 w-full min-h-16 lg:h-20 bg-papatya-surface/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between gap-2 px-3 md:px-8 lg:px-12 xl:px-16 border-b border-papatya-rule">

            {/* Left: Home & Clock */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0 shrink-0">
                {/* Kısa dokunuş: ana sayfaya git. Uzun basma (~700ms): ebeveyn
                    kapısını aç (Faz 1.3) — çocuğun yanlışlıkla bulamayacağı bir jest. */}
                <Link
                    href="/"
                    {...longPress}
                    className="inline-flex items-center justify-center min-w-tap min-h-tap p-2 bg-papatya-petal/15 rounded-xl text-papatya-petal-deep hover:bg-papatya-petal/25 hover:scale-105 transition-all shadow-sm border border-papatya-petal/30 shrink-0"
                    title="Ana Sayfa"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ikonlar/home.png" alt="" className="w-6 h-6 lg:w-7 lg:h-7" />
                </Link>

                <div className="flex flex-col">
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-papatya-ink font-mono leading-none">{time}</span>
                    <span className="text-xs text-papatya-ink-soft font-bold hidden md:block">CANLI</span>
                </div>
            </div>

            {/* Center: Date — 2026-09-14 kullanıcı bulgusu: dar mobilde (≤400px)
                uzun Türkçe tarih string'i ("14 Eylül Pazartesi") sol/sağ
                gruplarla çakışıp ikinci satıra taşıyordu. `truncate` + `min-w-0`
                ile taşan metin kırpılır (üç nokta), çakışma yerine zarif kesilme
                olur; `hidden xs:block` yok çünkü tarih çocuk için önemli bir
                bilgi — tamamen gizlemek yerine küçük ekranda kırpılması tercih
                edildi. */}
            <div className="flex-1 min-w-0 text-center text-sm sm:text-lg md:text-xl lg:text-2xl font-hand font-bold text-papatya-ink-soft truncate px-1">
                {dateStr}
            </div>

            {/* Right: süre özeti / Daisy progress / gün durumu / ebeveyn kilidi */}
            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 shrink-0">
                {mounted && (
                    <div className="hidden sm:flex items-center gap-1.5 text-xs lg:text-sm text-papatya-ink-soft font-semibold whitespace-nowrap">
                        <Timer size={14} className="text-papatya-sky shrink-0" />
                        <span>{isDayComplete ? 'Tamamlandı 🎉' : `${usedMin}/${limitMin} dk`}</span>
                    </div>
                )}

                <DaisyProgress filledCount={filledPetals} size={36} className="lg:w-11 lg:h-11" />

                {/* 2026-09-13 — UX denetiminde kullanıcı bunu bir tema anahtarı
                    sandı (bir düğme değil, yalnızca gün durumu göstergesi).
                    Gerçek koyu tema Faz 5'e bırakıldı (bkz. YOL-HARITASI.md);
                    burada yalnızca bir buton gibi görünmediğinden emin olunuyor
                    ve ne olduğu title/aria-label ile açıklanıyor. */}
                <div
                    className="text-papatya-sky cursor-default"
                    title={isDayComplete ? 'Bugünün etkinlikleri tamamlandı' : 'Gün devam ediyor'}
                    aria-label={isDayComplete ? 'Bugünün etkinlikleri tamamlandı' : 'Gün devam ediyor'}
                >
                    {isDayComplete ? <Moon size={24} className="fill-papatya-sky lg:w-7 lg:h-7" /> : <Sun size={24} className="text-papatya-petal lg:w-7 lg:h-7" />}
                </div>

                {/* Faz 3 UX düzeltmesi (2026-09-13) — Header'ın 700ms uzun-basma
                    jestiyle AYNI eylemi (openPinPrompt) tetikleyen görünür bir
                    düğme; eskiden ayrı ParentFooter'daydı. */}
                <button
                    type="button"
                    onClick={() => openPinPrompt()}
                    className="pl-3 lg:pl-4 border-l border-papatya-rule min-w-tap min-h-tap flex items-center justify-center text-papatya-ink-soft hover:text-papatya-ink transition-colors"
                    aria-label="Ebeveyn kilidini aç"
                >
                    <Lock size={18} className="lg:w-5 lg:h-5" />
                </button>
            </div>
        </header>
    );
}
