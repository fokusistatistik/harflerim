'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Compass, Target, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { WaterEngine } from '@/lib/waterEngine';
import {
    TOY_DEFINITIONS,
    type FloatingToyDef,
} from '@/lib/waterLogic';
import {
    WATER_TREASURES,
    loadWaterCollection,
    saveWaterCollection,
    addWaterTreasure,
    type WaterTreasureDef,
} from '@/lib/waterCollection';

/** Sunucuya her su hareketinde değil, her N başarılı etkileşimde tek kayıt gider (1 çekirdekli sunucuyu korur). */
const SKILL_BATCH_SIZE = 5;

type Mode = 'free' | 'target';

/**
 * Neşeli Havuz — Pilot v2 (Tam ekran, 60fps HTML5 Canvas, Prosedürel Su & Fizik Motoru).
 *
 * Dış kabuk yalnızca günlük süre bütçesini izler; bitince sahne tamamen
 * sökülür (motor, rAF ve tam ekran temizlenir) ve yumuşak kapanış gösterilir.
 */
export function WaterPoolGame() {
    const budget = useArcadeDayBudget('arcade-water-pool');

    if (budget?.isArcadeDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget ? Math.ceil(budget.remainingArcadeSeconds / 60) : 30;
    return <WaterPoolScene remainingMinutes={remainingMinutes} />;
}

function WaterPoolScene({ remainingMinutes }: { remainingMinutes: number }) {
    const reward = useRewardMoment();
    const calmingMonitor = useCalmingModeMonitor('el-goz-koordinasyonu');
    const { speak, stop } = useAudio();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bookBtnRef = useRef<HTMLButtonElement | null>(null);
    const engineRef = useRef<WaterEngine | null>(null);

    const [mode, setMode] = useState<Mode>('free');
    const [currentTargetToy, setCurrentTargetToy] = useState<FloatingToyDef | null>(null);
    const [collected, setCollected] = useState<string[]>([]);
    const [bookOpen, setBookOpen] = useState(false);
    const [bookBump, setBookBump] = useState(0);
    const [muted, setMuted] = useState(false);
    const [showHint, setShowHint] = useState(true);

    const collectedRef = useRef<string[]>([]);
    const mutedRef = useRef(false);
    const modeRef = useRef<Mode>('free');
    const successCountRef = useRef(0);
    const pendingSkillRef = useRef(0);
    const lastSpeakTimeRef = useRef(0);
    const fullscreenTriedRef = useRef(false);

    const say = useCallback(
        (text: string) => {
            if (mutedRef.current) return;
            speak(text).catch(() => {});
        },
        [speak]
    );

    const flushSkill = useCallback(() => {
        if (pendingSkillRef.current <= 0) return;
        pendingSkillRef.current = 0;
        recordArcadeSkill('el-goz-koordinasyonu', 'arcade-water-pool', true).catch(() => {});
    }, []);

    const handlersRef = useRef<{
        onSplash: (toy: FloatingToyDef | null) => void;
        onTargetReached: (toy: FloatingToyDef, treasure: WaterTreasureDef) => void;
        onTargetChanged: (nextToy: FloatingToyDef) => void;
        onTreasureLand: (treasure: WaterTreasureDef) => void;
    }>({
        onSplash: () => {},
        onTargetReached: () => {},
        onTargetChanged: () => {},
        onTreasureLand: () => {},
    });

    handlersRef.current = {
        onSplash: (toy) => {
            calmingMonitor(true);
            pendingSkillRef.current += 1;
            if (pendingSkillRef.current >= SKILL_BATCH_SIZE) {
                flushSkill();
            }

            // Arada bir yumuşak sözlü geri bildirim
            const now = Date.now();
            if (now - lastSpeakTimeRef.current > 7000) {
                lastSpeakTimeRef.current = now;
                if (toy) {
                    say(`${toy.name} suyun üstünde yüzüyor!`);
                } else if (Math.random() < 0.3) {
                    say('Şıp şıp, su ne kadar güzel!');
                }
            }
        },

        onTargetReached: (toy, _treasure) => {
            calmingMonitor(true);
            successCountRef.current += 1;
            pendingSkillRef.current += 2;
            flushSkill();

            say(`Harika! ${toy.name} nilüfere ulaştı!`);

            if (successCountRef.current % 3 === 0) {
                const reduce = document.documentElement.dataset.reduceMotion === 'true';
                reward({
                    message: 'Muhteşem yüzdürdün!',
                    confettiOptions: { particleCount: reduce ? 0 : 35, spread: 55 },
                });
            }
        },

        onTargetChanged: (nextTarget) => {
            if (modeRef.current === 'target') {
                setCurrentTargetToy(nextTarget);
                say(`${nextTarget.name}'i nilüfere doğru yüzdürelim!`);
            }
        },

        onTreasureLand: (treasure) => {
            const result = addWaterTreasure(collectedRef.current, treasure.id);
            if (!result.isNew) return;

            collectedRef.current = result.next;
            setCollected(result.next);
            saveWaterCollection(result.next);
            setBookBump((n) => n + 1);

            if (result.isComplete) {
                reward({ message: 'Deniz Hazine Defterin tamamlandı!' });
                say('Tebrikler! Bütün deniz hazinelerini keşfettin!');
            }
        },
    };

    // Motoru kur / temizle
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const initial = loadWaterCollection();
        collectedRef.current = initial;
        setCollected(initial);

        const reduceMotion =
            document.documentElement.dataset.reduceMotion === 'true' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const engine = new WaterEngine(canvas, {
            reduceMotion,
            onSplash: (toy) => handlersRef.current.onSplash(toy),
            onTargetReached: (toy, treasure) => handlersRef.current.onTargetReached(toy, treasure),
            onTargetChanged: (toy) => handlersRef.current.onTargetChanged(toy),
            onTreasureLand: (treasure) => handlersRef.current.onTreasureLand(treasure),
            getCollected: () => collectedRef.current,
            getBookTarget: () => {
                const c = canvas.getBoundingClientRect();
                const b = bookBtnRef.current?.getBoundingClientRect();
                if (!b) return { x: c.width - 40, y: 40 };
                return { x: b.left + b.width / 2 - c.left, y: b.top + b.height / 2 - c.top };
            },
        });
        engineRef.current = engine;

        const measure = () => {
            const rect = container.getBoundingClientRect();
            engine.resize(rect.width, rect.height);
        };
        measure();
        engine.start();

        const ro = new ResizeObserver(measure);
        ro.observe(container);

        // Sayfa kaymasını engelle
        const prevOverflow = document.body.style.overflow;
        const prevOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';

        const hintTimer = setTimeout(() => setShowHint(false), 6500);
        say('Suya dokunarak dalgalar oluştur, sevimli oyuncakları yüzdür!');

        return () => {
            clearTimeout(hintTimer);
            ro.disconnect();
            engine.destroy();
            engineRef.current = null;
            flushSkill();
            document.body.style.overflow = prevOverflow;
            document.body.style.overscrollBehavior = prevOverscroll;
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Defter açıkken çizimi durdur
    useEffect(() => {
        engineRef.current?.setPaused(bookOpen);
    }, [bookOpen]);

    const tryFullscreen = () => {
        if (fullscreenTriedRef.current) return;
        fullscreenTriedRef.current = true;
        if (!window.matchMedia('(pointer: coarse)').matches) return;
        const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
        if (document.fullscreenEnabled && el.requestFullscreen) {
            el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
        } else if (el.webkitRequestFullscreen) {
            Promise.resolve(el.webkitRequestFullscreen()).catch(() => {});
        }
    };

    const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        tryFullscreen();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // sessiz geç
        }
        const rect = e.currentTarget.getBoundingClientRect();
        engineRef.current?.pointerDown(e.pointerId, e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        engineRef.current?.pointerMove(e.pointerId, e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // sessiz geç
        }
        engineRef.current?.pointerUp(e.pointerId);
    };

    const handleCanvasPointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // sessiz geç
        }
        engineRef.current?.pointerCancel(e.pointerId);
    };

    const switchMode = (next: Mode) => {
        if (next === mode) return;
        setMode(next);
        modeRef.current = next;

        if (engineRef.current) {
            engineRef.current.setMode(next);
            if (next === 'target') {
                const targetToy = engineRef.current.getTargetToy();
                setCurrentTargetToy(targetToy);
                if (targetToy) {
                    say(`${targetToy.name}'i nilüfere doğru yüzdürelim!`);
                }
            } else {
                setCurrentTargetToy(null);
                say('Hadi serbestçe suyla oynayalım!');
            }
        }
    };

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        mutedRef.current = next;
        engineRef.current?.setMuted(next);
        if (next) stop();
    };

    const total = WATER_TREASURES.length;
    const glass =
        'min-w-tap min-h-tap flex items-center justify-center rounded-full bg-white/70 border border-white/80 text-papatya-ink shadow-sm active:scale-95 transition-transform backdrop-blur-md';

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 select-none overflow-hidden touch-none bg-[#0284C7]"
            style={{ height: '100dvh' }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerCancel}
                className="absolute inset-0 block h-full w-full"
                role="img"
                aria-label="Neşeli havuz su yüzeyi. Dokunarak dalgalar oluşturabilir ve sevimli oyuncakları yüzdürebilirsiniz."
            />

            {/* Üst Çubuk (HUD) */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3 z-30"
                style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
            >
                {/* Sol: Geri Dönüş Butonu */}
                <Link
                    href="/games/fun-hub"
                    aria-label="Oyun Dünyasına dön"
                    className={`${glass} pointer-events-auto`}
                >
                    <ArrowLeft size={22} />
                </Link>

                {/* Orta: Süre ve Hedef Göstergesi */}
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-semibold text-papatya-ink backdrop-blur-md shadow-sm">
                        <Clock size={14} />
                        <span>{remainingMinutes} dk</span>
                    </div>

                    {mode === 'target' && currentTargetToy && (
                        <div className="flex items-center gap-1.5 rounded-full border-2 border-emerald-400 bg-white/90 px-3 py-1 shadow-md backdrop-blur-md max-w-full">
                            <span className="text-base" role="img" aria-hidden="true">
                                {currentTargetToy.emoji}
                            </span>
                            <span className="truncate text-xs font-extrabold text-papatya-ink">
                                {currentTargetToy.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Sağ: Mod Değiştirici, Ses ve Hazine Defteri */}
                <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center rounded-full border border-white/80 bg-white/70 p-0.5 shadow-sm backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => switchMode('free')}
                            aria-label="Serbest su modu"
                            aria-pressed={mode === 'free'}
                            className={`min-w-tap min-h-tap flex items-center justify-center rounded-full transition-colors ${
                                mode === 'free' ? 'bg-sky-500 text-white' : 'text-papatya-ink/70'
                            }`}
                        >
                            <Compass size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('target')}
                            aria-label="Hedef nilüfer modu"
                            aria-pressed={mode === 'target'}
                            className={`min-w-tap min-h-tap flex items-center justify-center rounded-full transition-colors ${
                                mode === 'target' ? 'bg-emerald-500 text-white' : 'text-papatya-ink/70'
                            }`}
                        >
                            <Target size={20} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
                        aria-pressed={muted}
                        className={glass}
                    >
                        {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>

                    <button
                        ref={bookBtnRef}
                        type="button"
                        onClick={() => setBookOpen(true)}
                        aria-label={`Deniz hazine defterim, ${collected.length} / ${total}`}
                        className={`${glass} relative ${bookBump > 0 ? 'balloon-book-bump' : ''}`}
                        key={bookBump}
                    >
                        <BookOpen size={22} />
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-sky-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                            {collected.length}/{total}
                        </span>
                    </button>
                </div>
            </div>

            {/* İlk Saniyelerde Kısa Sakinleştirici İpucu */}
            {showHint && (
                <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85 backdrop-blur-md px-5 py-2 text-xs md:text-sm font-semibold text-papatya-ink shadow-md"
                    style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
                >
                    💦 Suya dokun, dalgalar oluştur ve sevimli oyuncakları yüzdür!
                </div>
            )}

            {/* Deniz Hazine Defteri Modalı */}
            {bookOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Deniz Hazine Defterim"
                >
                    <div className="w-full max-w-md rounded-3xl border-4 border-sky-300/60 bg-papatya-surface p-5 shadow-2xl">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Sparkles className="text-sky-500" size={24} />
                            <h2 className="text-center text-xl font-extrabold text-papatya-ink">
                                Deniz Hazine Defteri
                            </h2>
                        </div>
                        <p className="mb-4 text-center text-sm font-semibold text-papatya-ink/70">
                            {collected.length} / {total} Deniz Hazinesi Keşfedildi
                        </p>

                        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-h-[60vh] overflow-y-auto p-1">
                            {WATER_TREASURES.map((item) => {
                                const has = collected.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col items-center justify-center rounded-2xl border-2 p-2.5 transition-all text-center"
                                        style={{
                                            borderColor: has ? '#38BDF8' : 'rgba(0,0,0,0.08)',
                                            backgroundColor: has ? '#F0F9FF' : 'rgba(0,0,0,0.03)',
                                        }}
                                        title={has ? `${item.label} — ${item.description}` : 'Keşfedilmeyi bekliyor'}
                                    >
                                        <span
                                            className="text-3xl mb-1"
                                            style={has ? undefined : { filter: 'grayscale(1) opacity(0.25)' }}
                                            aria-hidden="true"
                                        >
                                            {item.emoji}
                                        </span>
                                        <span className="text-[10px] font-bold text-papatya-ink/80 leading-tight">
                                            {has ? item.label : '???'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setBookOpen(false)}
                            className="mt-5 min-h-tap w-full rounded-full bg-sky-500 hover:bg-sky-600 px-6 py-3 text-base font-bold text-white shadow-md active:scale-95 transition-transform"
                        >
                            Havuza Dön
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
