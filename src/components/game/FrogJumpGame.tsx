'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { FrogEngine } from '@/lib/frogEngine';
import {
    POND_FRIENDS,
    loadPondCollection,
    savePondCollection,
    addPondFriend,
    type PondFriendDef,
} from '@/lib/frogCollection';

/** Sunucuya her zıplamada değil, her N başarılı etkileşimde tek kayıt gider (1 çekirdekli sunucuyu korur). */
const SKILL_BATCH_SIZE = 4;

/**
 * Zıp Zıp Kurbağa — Pilot v2 (Tam Ekran 60fps HTML5 Canvas, Prosedürel Gölet ve Kurbağa Fiziği).
 *
 * Dış kabuk yalnızca günlük süre bütçesini izler; bitince sahne tamamen
 * sökülür (motor, rAF ve ses sentezleyici temizlenir) ve yumuşak kapanış gösterilir.
 */
export function FrogJumpGame() {
    const budget = useArcadeDayBudget('arcade-frog-jump');

    if (budget?.isArcadeDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget ? Math.ceil(budget.remainingArcadeSeconds / 60) : 30;
    return <FrogJumpScene remainingMinutes={remainingMinutes} />;
}

function FrogJumpScene({ remainingMinutes }: { remainingMinutes: number }) {
    const reward = useRewardMoment();
    const calmingMonitor = useCalmingModeMonitor('ritim-zamanlama');
    const { speak, stop } = useAudio();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bookBtnRef = useRef<HTMLButtonElement | null>(null);
    const engineRef = useRef<FrogEngine | null>(null);

    const [scoreCount, setScoreCount] = useState(0);
    const [collected, setCollected] = useState<string[]>([]);
    const [bookOpen, setBookOpen] = useState(false);
    const [bookBump, setBookBump] = useState(0);
    const [muted, setMuted] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [encouragement, setEncouragement] = useState<string | null>(null);

    const collectedRef = useRef<string[]>([]);
    const mutedRef = useRef(false);
    const pendingSkillRef = useRef(0);
    const encouragementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fullscreenTriedRef = useRef(false);

    const say = useCallback(
        (text: string) => {
            if (mutedRef.current) return;
            speak(text).catch(() => {});
        },
        [speak]
    );

    const flushSkill = useCallback((success: boolean) => {
        if (pendingSkillRef.current <= 0) return;
        pendingSkillRef.current = 0;
        recordArcadeSkill('ritim-zamanlama', 'arcade-frog-jump', success).catch(() => {});
    }, []);

    const handlersRef = useRef<{
        onJump: () => void;
        onLand: (score: number, friend: PondFriendDef) => void;
        onMiss: () => void;
        onFriendLand: (friend: PondFriendDef) => void;
    }>({
        onJump: () => {},
        onLand: () => {},
        onMiss: () => {},
        onFriendLand: () => {},
    });

    handlersRef.current = {
        onJump: () => {
            setShowHint(false);
        },

        onLand: (score, _friend) => {
            setScoreCount(score);
            calmingMonitor(true);
            pendingSkillRef.current += 1;
            if (pendingSkillRef.current >= SKILL_BATCH_SIZE) {
                flushSkill(true);
            }

            if (score % 3 === 0) {
                const reduce = document.documentElement.dataset.reduceMotion === 'true';
                reward({
                    message: 'Harika bir zıplayış!',
                    confettiOptions: { particleCount: reduce ? 0 : 35, spread: 55 },
                });
                say('Harika bir zıplayış! Nilüfere kondun!');
            }
        },

        onMiss: () => {
            calmingMonitor(false);
            if (encouragementTimerRef.current) clearTimeout(encouragementTimerRef.current);
            setEncouragement('Hop! Kıyıya tutunduk, bir daha deneyelim 🌿');
            say('Hop! Bir daha deneyelim!');

            encouragementTimerRef.current = setTimeout(() => {
                setEncouragement(null);
            }, 1800);
        },

        onFriendLand: (friend) => {
            const result = addPondFriend(collectedRef.current, friend.id);
            if (!result.isNew) return;

            collectedRef.current = result.next;
            setCollected(result.next);
            savePondCollection(result.next);
            setBookBump((n) => n + 1);

            if (result.isComplete) {
                reward({ message: 'Göl Dostları Defterin tamamlandı!' });
                say('Tebrikler! Bütün göl dostlarını keşfettin!');
            }
        },
    };

    // Motoru kur / temizle
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const initial = loadPondCollection();
        collectedRef.current = initial;
        setCollected(initial);

        const reduceMotion =
            document.documentElement.dataset.reduceMotion === 'true' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const engine = new FrogEngine(canvas, {
            reduceMotion,
            onJump: () => handlersRef.current.onJump(),
            onLand: (s, f) => handlersRef.current.onLand(s, f),
            onMiss: () => handlersRef.current.onMiss(),
            onFriendLand: (f) => handlersRef.current.onFriendLand(f),
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
            const w = rect.width || window.innerWidth;
            const h = rect.height || window.innerHeight;
            if (w > 0 && h > 0) {
                engine.resize(w, h);
            }
        };
        measure();
        engine.start();

        const ro = new ResizeObserver(measure);
        ro.observe(container);

        const prevOverflow = document.body.style.overflow;
        const prevOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';

        const hintTimer = setTimeout(() => setShowHint(false), 6500);
        say('Nilüfer yaprağı hizalanınca ekrana dokun ve kurbağayı zıplat!');

        return () => {
            clearTimeout(hintTimer);
            if (encouragementTimerRef.current) clearTimeout(encouragementTimerRef.current);
            ro.disconnect();
            engine.destroy();
            engineRef.current = null;
            flushSkill(true);
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

    const handleActionJump = () => {
        tryFullscreen();
        engineRef.current?.jump();
    };

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        mutedRef.current = next;
        engineRef.current?.setMuted(next);
        if (next) stop();
    };

    const total = POND_FRIENDS.length;
    const glass =
        'min-w-tap min-h-tap flex items-center justify-center rounded-full bg-white/70 border border-white/80 text-papatya-ink shadow-sm active:scale-95 transition-transform backdrop-blur-md';

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 select-none overflow-hidden touch-none bg-[#0D9488]"
            style={{ height: '100dvh' }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={handleActionJump}
                className="absolute inset-0 block h-full w-full cursor-pointer"
                role="img"
                aria-label="Zıp zıp kurbağa gölet sahnesi. Ekrana dokunarak kurbağayı nilüfere doğru zıplatın."
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

                {/* Orta: Süre ve Başarı Göstergesi */}
                <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-semibold text-papatya-ink backdrop-blur-md shadow-sm">
                        <Clock size={14} />
                        <span>{remainingMinutes} dk</span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full border-2 border-emerald-400 bg-white/90 px-3 py-1 shadow-md backdrop-blur-md">
                        <Sparkles size={14} className="text-emerald" />
                        <span className="text-xs font-extrabold text-papatya-ink">
                            Zıplama: {scoreCount}
                        </span>
                    </div>
                </div>

                {/* Sağ: Ses ve Hazine Defteri */}
                <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
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
                        aria-label={`Göl dostları defterim, ${collected.length} / ${total}`}
                        className={`${glass} relative ${bookBump > 0 ? 'balloon-book-bump' : ''}`}
                        key={bookBump}
                    >
                        <BookOpen size={22} />
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald px-1.5 text-[10px] font-bold leading-4 text-white">
                            {collected.length}/{total}
                        </span>
                    </button>
                </div>
            </div>

            {/* Teşvik ve No-Failure Bildirimi */}
            {encouragement && (
                <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-emerald-300 bg-white/95 px-5 py-2 text-xs md:text-sm font-extrabold text-emerald-900 shadow-xl backdrop-blur-md transition-all z-40"
                    style={{ top: 'max(4.5rem, calc(env(safe-area-inset-top) + 3.8rem))' }}
                >
                    {encouragement}
                </div>
            )}

            {/* İlk Saniyelerde Kısa Sakinleştirici İpucu */}
            {showHint && (
                <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/85 backdrop-blur-md px-5 py-2 text-xs md:text-sm font-semibold text-papatya-ink shadow-md z-30"
                    style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
                >
                    🐸 Nilüfer yaprağı hizalanınca dokun ve zıpla!
                </div>
            )}

            {/* Alt Dokunma / Zıplama Butonu (Küçük Parmaklar İçin Ekstra Rahat Hedef) */}
            <div
                className="pointer-events-auto absolute inset-x-0 bottom-4 flex justify-center px-4 z-30"
                style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
            >
                <button
                    type="button"
                    onPointerDown={handleActionJump}
                    onClick={handleActionJump}
                    aria-label="Kurbağayı Zıplat"
                    className="flex items-center justify-center gap-2 rounded-full bg-emerald hover:bg-emerald/90 px-8 py-3.5 text-base md:text-lg font-extrabold text-white shadow-xl border-2 border-white/60 active:scale-95 transition-transform"
                >
                    <span className="text-xl">🐸</span>
                    <span>Hadi Zıpla!</span>
                </button>
            </div>

            {/* Göl Dostları Defteri Modalı */}
            {bookOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Göl Dostları Defterim"
                >
                    <div className="w-full max-w-md rounded-3xl border-4 border-emerald-300/60 bg-papatya-surface p-5 shadow-2xl">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Sparkles className="text-emerald" size={24} />
                            <h2 className="text-center text-xl font-extrabold text-papatya-ink">
                                Göl Dostları Defteri
                            </h2>
                        </div>
                        <p className="mb-4 text-center text-sm font-semibold text-papatya-ink/70">
                            {collected.length} / {total} Göl Dostu Keşfedildi
                        </p>

                        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-h-[60vh] overflow-y-auto p-1">
                            {POND_FRIENDS.map((item) => {
                                const has = collected.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="flex flex-col items-center justify-center rounded-2xl border-2 p-2.5 transition-all text-center"
                                        style={{
                                            borderColor: has ? '#34D399' : 'rgba(0,0,0,0.08)',
                                            backgroundColor: has ? '#ECFDF5' : 'rgba(0,0,0,0.03)',
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
                            className="mt-5 min-h-tap w-full rounded-full bg-emerald hover:bg-emerald/90 px-6 py-3 text-base font-bold text-white shadow-md active:scale-95 transition-transform"
                        >
                            Gölete Dön
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
