'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Compass, Target, Volume2, VolumeX } from 'lucide-react';
import { useArcadeDayBudget } from '@/hooks/useArcadeDayBudget';
import { ArcadeDayComplete } from '@/components/ui/ArcadeDayComplete';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordArcadeSkill } from '@/actions/arcade';
import { useAudio } from '@/components/AudioProvider';
import { BalloonEngine } from '@/lib/balloonEngine';
import {
    BALLOON_PALETTES,
    STICKERS,
    getPalette,
    type BalloonColorName,
    type StickerDef,
} from '@/lib/balloonLogic';
import { addSticker, loadCollection, saveCollection } from '@/lib/balloonCollection';

/** Sunucuya her patlatmada değil, her N başarılı patlatmada tek kayıt gider (1 çekirdekli sunucuyu korur). */
const SKILL_BATCH_SIZE = 5;

type Mode = 'free' | 'target';

/**
 * Sakin Balonlar — pilot v2 (tam ekran, canvas, prosedürel grafik).
 *
 * Dış kabuk yalnızca günlük süre bütçesini izler; bitince sahne tamamen
 * sökülür (motor/rAF/tam ekran temizlenir) ve yumuşak kapanış gösterilir.
 */
export function BubblePopGame() {
    const budget = useArcadeDayBudget('arcade-bubble-pop');

    if (budget?.isArcadeDayComplete) {
        return <ArcadeDayComplete />;
    }

    const remainingMinutes = budget ? Math.ceil(budget.remainingArcadeSeconds / 60) : 30;
    return <BalloonScene remainingMinutes={remainingMinutes} />;
}

function BalloonScene({ remainingMinutes }: { remainingMinutes: number }) {
    const reward = useRewardMoment();
    const calmingMonitor = useCalmingModeMonitor('gorsel-takip');
    const { speak, stop } = useAudio();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const bookBtnRef = useRef<HTMLButtonElement | null>(null);
    const engineRef = useRef<BalloonEngine | null>(null);

    const [mode, setMode] = useState<Mode>('free');
    const [targetColor, setTargetColor] = useState<BalloonColorName | null>(null);
    const [collected, setCollected] = useState<string[]>([]);
    const [bookOpen, setBookOpen] = useState(false);
    const [bookBump, setBookBump] = useState(0);
    const [muted, setMuted] = useState(false);
    const [showHint, setShowHint] = useState(true);

    // Motor callback'leri her render'da güncel kalır; motor bir kez kurulur.
    const collectedRef = useRef<string[]>([]);
    const mutedRef = useRef(false);
    const targetRef = useRef<BalloonColorName | null>(null);
    const modeRef = useRef<Mode>('free');
    const popCountRef = useRef(0);
    const pendingSkillRef = useRef(0);
    const lastWrongSpeakRef = useRef(0);
    const targetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fullscreenTriedRef = useRef(false);
    const audioPoolRef = useRef<HTMLAudioElement[]>([]);
    const audioIdxRef = useRef(0);

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
        recordArcadeSkill('gorsel-takip', 'arcade-bubble-pop', true).catch(() => {});
    }, []);

    const pickNewTarget = useCallback(() => {
        const choices = BALLOON_PALETTES.filter((p) => p.name !== targetRef.current);
        const next = choices[Math.floor(Math.random() * choices.length)].name;
        targetRef.current = next;
        setTargetColor(next);
        engineRef.current?.setTarget(next);
        say(`${next} balonu bulabilecek misin?`);
    }, [say]);

    const handlersRef = useRef<{
        onPop: (s: StickerDef) => void;
        onWrong: (s: StickerDef) => void;
        onStickerLand: (s: StickerDef) => void;
    }>({
        onPop: () => {},
        onWrong: () => {},
        onStickerLand: () => {},
    });

    handlersRef.current = {
        onPop: () => {
            // Pop sesi: önceden yüklenmiş küçük havuz, her seferinde yeni Audio üretmez.
            if (!mutedRef.current) {
                const pool = audioPoolRef.current;
                const a = pool[audioIdxRef.current++ % Math.max(1, pool.length)];
                if (a) {
                    try {
                        a.currentTime = 0;
                        a.playbackRate = 0.95 + Math.random() * 0.15;
                        a.play().catch(() => {});
                    } catch {
                        // sessiz geç
                    }
                }
            }

            calmingMonitor(true);
            popCountRef.current += 1;
            pendingSkillRef.current += 1;
            if (pendingSkillRef.current >= SKILL_BATCH_SIZE) flushSkill();

            if (popCountRef.current % 5 === 0) {
                const reduce = document.documentElement.dataset.reduceMotion === 'true';
                reward({
                    message: 'Harika patlattın!',
                    confettiOptions: { particleCount: reduce ? 0 : 45, spread: 60 },
                });
            }

            if (modeRef.current === 'target') {
                if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
                targetTimerRef.current = setTimeout(pickNewTarget, 700);
            }
        },
        onWrong: (sticker) => {
            calmingMonitor(false);
            const now = Date.now();
            if (now - lastWrongSpeakRef.current > 4000 && targetRef.current) {
                lastWrongSpeakRef.current = now;
                say(`Bu ${sticker.color} balon, ${targetRef.current} balonu bulalım!`);
            }
        },
        onStickerLand: (sticker) => {
            const result = addSticker(collectedRef.current, sticker.id);
            if (!result.isNew) return;
            collectedRef.current = result.next;
            setCollected(result.next);
            saveCollection(result.next);
            setBookBump((n) => n + 1);
            if (result.isComplete) {
                reward({ message: 'Sticker defterin tamamlandı!' });
            }
        },
    };

    // Motoru kur / temizle
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const initial = loadCollection();
        collectedRef.current = initial;
        setCollected(initial);

        audioPoolRef.current = Array.from({ length: 3 }, () => {
            const a = new Audio('/sounds/pop.wav');
            a.volume = 0.5;
            a.preload = 'auto';
            return a;
        });

        const reduceMotion =
            document.documentElement.dataset.reduceMotion === 'true' ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const engine = new BalloonEngine(canvas, {
            reduceMotion,
            onPop: (s) => handlersRef.current.onPop(s),
            onWrong: (s) => handlersRef.current.onWrong(s),
            onStickerLand: (s) => handlersRef.current.onStickerLand(s),
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

        // Sayfa kaymasını/aşağı çekip yenilemeyi engelle (tam ekran his).
        const prevOverflow = document.body.style.overflow;
        const prevOverscroll = document.body.style.overscrollBehavior;
        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';

        const hintTimer = setTimeout(() => setShowHint(false), 6000);
        say('Uçan balonlara dokun ve patlat!');

        return () => {
            clearTimeout(hintTimer);
            if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
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
        // Bilerek yalnızca mount'ta: motor tek sefer kurulur.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Defter açıkken çizimi durdur.
    useEffect(() => {
        engineRef.current?.setPaused(bookOpen);
    }, [bookOpen]);

    const tryFullscreen = () => {
        if (fullscreenTriedRef.current) return;
        fullscreenTriedRef.current = true;
        // Yalnızca dokunmatik cihazlarda; masaüstünü rahatsız etme. documentElement:
        // Sakinleştirme modu/bildirimler de tam ekranda görünür kalsın.
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
        const rect = e.currentTarget.getBoundingClientRect();
        engineRef.current?.pointerDown(e.clientX - rect.left, e.clientY - rect.top);
    };

    const switchMode = (next: Mode) => {
        if (next === mode) return;
        setMode(next);
        modeRef.current = next;
        if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
        if (next === 'target') {
            targetRef.current = null;
            pickNewTarget();
        } else {
            targetRef.current = null;
            setTargetColor(null);
            engineRef.current?.setTarget(null);
            say('Uçan balonlara dokun ve patlat!');
        }
    };

    const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        mutedRef.current = next;
        if (next) stop();
    };

    const total = STICKERS.length;
    const targetPalette = targetColor ? getPalette(targetColor) : null;

    const glass =
        'min-w-tap min-h-tap flex items-center justify-center rounded-full bg-white/60 border border-white/70 text-papatya-ink shadow-sm active:scale-95 transition-transform';

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 select-none overflow-hidden touch-none bg-[#8EA9F7]"
            style={{ height: '100dvh' }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={handleCanvasPointerDown}
                className="absolute inset-0 block h-full w-full"
                role="img"
                aria-label="Gökyüzünde süzülen renkli balonlar. Dokunarak patlat."
            />

            {/* Üst çubuk: yalnızca küçük, yarı saydam kontroller */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3"
                style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
            >
                <Link
                    href="/games/fun-hub"
                    aria-label="Oyun Dünyasına dön"
                    className={`${glass} pointer-events-auto`}
                >
                    <ArrowLeft size={22} />
                </Link>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-semibold text-papatya-ink">
                        <Clock size={14} />
                        <span>{remainingMinutes} dk</span>
                    </div>
                    {mode === 'target' && targetPalette && (
                        <div
                            className="flex items-center gap-2 rounded-full border-2 bg-white/85 px-4 py-1.5 shadow-md"
                            style={{ borderColor: targetPalette.base }}
                        >
                            <span
                                className="inline-block h-5 w-5 rounded-full border border-white/80"
                                style={{ backgroundColor: targetPalette.base }}
                            />
                            <span className="whitespace-nowrap text-sm font-extrabold text-papatya-ink">{targetPalette.name} Balon</span>
                        </div>
                    )}
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-white/70 bg-white/60 p-0.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() => switchMode('free')}
                            aria-label="Serbest mod"
                            aria-pressed={mode === 'free'}
                            className={`min-w-tap min-h-tap flex items-center justify-center rounded-full transition-colors ${
                                mode === 'free' ? 'bg-papatya-rose text-white' : 'text-papatya-ink/70'
                            }`}
                        >
                            <Compass size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('target')}
                            aria-label="Renk hedefi modu"
                            aria-pressed={mode === 'target'}
                            className={`min-w-tap min-h-tap flex items-center justify-center rounded-full transition-colors ${
                                mode === 'target' ? 'bg-papatya-petal text-papatya-ink' : 'text-papatya-ink/70'
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
                        aria-label={`Sticker defterim, ${collected.length} / ${total}`}
                        className={`${glass} relative ${bookBump > 0 ? 'balloon-book-bump' : ''}`}
                        key={bookBump}
                    >
                        <BookOpen size={22} />
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-papatya-rose px-1.5 text-[10px] font-bold leading-4 text-white">
                            {collected.length}/{total}
                        </span>
                    </button>
                </div>
            </div>

            {/* İlk saniyelerde kısa ipucu, sonra kendiliğinden kaybolur */}
            {showHint && (
                <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full bg-white/75 px-5 py-2 text-sm font-semibold text-papatya-ink shadow-sm"
                    style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
                >
                    🎈 Balonlara dokun!
                </div>
            )}

            {/* Sticker defteri */}
            {bookOpen && (
                <div
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Sticker defterim"
                >
                    <div className="w-full max-w-md rounded-3xl border-4 border-papatya-petal/40 bg-papatya-surface p-5 shadow-xl">
                        <h2 className="mb-1 text-center text-xl font-extrabold text-papatya-ink">Sticker Defterim</h2>
                        <p className="mb-4 text-center text-sm font-semibold text-papatya-ink/70">
                            {collected.length} / {total} arkadaş
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {STICKERS.map((s) => {
                                const has = collected.includes(s.id);
                                const pal = getPalette(s.color);
                                return (
                                    <div
                                        key={s.id}
                                        className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2"
                                        style={{
                                            borderColor: has ? pal.base : 'rgba(0,0,0,0.08)',
                                            backgroundColor: has ? `${pal.light}` : 'rgba(0,0,0,0.04)',
                                        }}
                                        title={has ? s.label : 'Henüz bulunmadı'}
                                    >
                                        <span
                                            className="text-3xl"
                                            style={has ? undefined : { filter: 'grayscale(1) opacity(0.22)' }}
                                            aria-hidden="true"
                                        >
                                            {s.emoji}
                                        </span>
                                        {has && <span className="mt-0.5 text-[9px] font-bold text-papatya-ink/70">{s.label}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setBookOpen(false)}
                            className="mt-5 min-h-tap w-full rounded-full bg-papatya-rose px-6 py-3 text-base font-bold text-white shadow-sm active:scale-95 transition-transform"
                        >
                            Devam Et
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
