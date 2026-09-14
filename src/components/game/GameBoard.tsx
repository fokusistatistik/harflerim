'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, defaultDropAnimationSideEffects, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import useSound from 'use-sound';

import { AUDIOS, type LetterAsset } from '@/store/gameData';
import { useLevelStore } from '@/store/levelStore';
import { useAudio } from '@/components/AudioProvider';
import { useNotificationStore } from '@/store/notificationStore';
import { useGameContent } from '@/hooks/useGameContent';
import { useHintTimer } from '@/hooks/useHintTimer';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { getAdaptiveRoundConfig } from '@/actions/game';
import { getTodaySkillStats, type TodaySkillStats } from '@/actions/skills';
import type { AdaptiveConfig } from '@/lib/adaptiveDifficulty';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { DraggableToken } from './DraggableToken';
import { TargetFrame } from './TargetFrame';
import { HintImage } from './HintImage';
import { GameHud } from './GameHud';

// 2026-09-14 — A/G/Ğ/H/J/L hedef harf olduğunda karşılığı hiç yoktu (bu
// harfler yalnızca BAŞKA harflerin çeldirici listesinde geçiyordu), bu
// yüzden adaptif zorluk bu 6 harfte sessizce rastgele çeldiriciye
// düşüyordu — eklendi. Ayrıca ölü rakam değerleri ('8','5','1','7' —
// `ALPHABET_ORDER`'da hiç yoklar, `startRound`'daki `includes` kontrolünü
// asla geçemiyorlardı) temizlendi.
const SIMILAR_MAPPING: Record<string, string[]> = {
    'A': ['E'],
    'E': ['F', 'L', 'I'],
    'F': ['E', 'P', 'T'],
    'O': ['Ö', 'D', 'C', 'G'],
    'Ö': ['O', 'Ü', 'C', 'G'],
    'Ü': ['U', 'Ö', 'V'],
    'U': ['Ü', 'V', 'J'],
    'B': ['R', 'P', 'D'],
    'D': ['B', 'P', 'O', 'C'],
    'P': ['R', 'B', 'D'],
    'R': ['P', 'B', 'K'],
    'M': ['N', 'H'],
    'N': ['M', 'H', 'Z'],
    'S': ['Ş', 'Z'],
    'Ş': ['S', 'Ç'],
    'C': ['Ç', 'O', 'D'],
    'Ç': ['C', 'S'],
    'G': ['O', 'Ö', 'C', 'Ğ'],
    'Ğ': ['G'],
    'H': ['M', 'N', 'K'],
    'K': ['H', 'R'],
    'I': ['İ', 'L'],
    'İ': ['I', 'J'],
    'J': ['İ', 'U'],
    'L': ['E', 'I'],
    'V': ['Y', 'U'],
    'Y': ['V', 'T'],
    'Z': ['N'],
    'T': ['Y', 'I']
};

// Faz 3.2 — hiç geçmiş yokken/sunucu çağrısı henüz dönmemişken kullanılan en
// kolay ayar. src/lib/adaptiveDifficulty.ts'teki BASE_ADAPTIVE_CONFIG ile
// AYNI değerler — o dosya sunucu-only (Prisma'ya dokunuyor) olduğu için
// buraya bilerek runtime import edilmiyor, yalnızca tipi paylaşılıyor.
const FALLBACK_DIFFICULTY: AdaptiveConfig = { optionCount: 2, distractorType: 'random', weakLetters: [] };

export default function GameBoard() {
    const { isDayComplete, sessionId, firstName, isLetterHuntLimitReached, dailyLetterHuntLimit } = useLevelStore();
    // 2026-09-14 — kullanıcı isteği: süre bütçesine EK, Harf Avı'na özel bir
    // günlük round limiti (varsayılan 100, ebeveyn panelinden ayarlanabilir).
    // Yalnızca bu oyunu kilitler — diğer oyunlar/global DayComplete ekranı
    // bundan etkilenmez.
    const isLocked = isDayComplete || isLetterHuntLimitReached;
    const { askLetter, encourageRetry, speak } = useAudio();
    const pushToast = useNotificationStore((s) => s.pushToast);
    const { data: content } = useGameContent();
    const triggerReward = useRewardMoment();
    const advanceLevel = useLevelStore((s) => s.advanceLevel);
    const checkCalmingMode = useCalmingModeMonitor('harf-tanima'); // Faz 3.2b

    // 2026-09-14 — kullanıcı bulgusu: sayfa yenilenince/tekrar girilince oyun
    // hep "Başla" ekranından açılıyordu, oyun ortasındaki bir çocuk için
    // gereksiz bir sürtünme. `isPlaying` niyeti sessionStorage'a yazılır (tam
    // round durumu değil — kasıtlı olarak basit tutuldu, bkz. aşağıdaki
    // useEffect); sekme kapanınca/farklı cihazda otomatik sıfırlanır.
    const PLAYING_STORAGE_KEY = 'papatya-playing-letter-hunt';
    const [isPlaying, setIsPlayingState] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return window.sessionStorage.getItem(PLAYING_STORAGE_KEY) === '1';
        } catch {
            return false;
        }
    });
    const setIsPlaying = (playing: boolean) => {
        setIsPlayingState(playing);
        try {
            if (playing) window.sessionStorage.setItem(PLAYING_STORAGE_KEY, '1');
            else window.sessionStorage.removeItem(PLAYING_STORAGE_KEY);
        } catch {
            /* sessionStorage yoksa sessizce yalnızca bu oturumda devam et */
        }
    };
    // 2026-09-14 — kullanıcı bulgusu: her doğru cevaptan sonra oyun
    // setIsPlaying(false) ile başlangıç ekranına dönüyordu — Faz 3.2'nin
    // "sonsuz round" ilkesiyle çelişen, eski 24-seviyeli sistemden kalma bir
    // kalıntıydı. Artık Hafıza Kartları'nın deseniyle tutarlı: doğru cevap
    // sonrası günlük bütçe dolmadıkça otomatik yeni round başlıyor, oyun
    // yalnızca "Ana Sayfa" düğmesiyle ya da günlük bütçe dolunca kapanıyor.
    const [roundsCompleted, setRoundsCompleted] = useState(0);
    // 2026-09-14 — kullanıcı isteğiyle: başlangıç ekranında "bugün kaç doğru
    // yaptın" özeti. Yalnızca başlangıç ekranındayken görünür, oyun sırasında
    // güncellenmez (sıralama/rekabet hissi vermemek için bilerek sade).
    const [todayStats, setTodayStats] = useState<TodaySkillStats | null>(null);
    useEffect(() => {
        getTodaySkillStats('harf-tanima').then(setTodayStats).catch(() => {});
    }, [isPlaying]);
    // Faz 3.2 — bir sonraki round'un zorluğu artık sabit bir "seviye" değil,
    // her round başında sunucudan tazece sorulan uyarlanabilir bir konfig.
    const [difficulty, setDifficulty] = useState<AdaptiveConfig>(FALLBACK_DIFFICULTY);

    // Round State
    const [targetLetter, setTargetLetter] = useState('A');
    const [currentObject, setCurrentObject] = useState<LetterAsset | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Audio
    const [playSuccess] = useSound(AUDIOS.correct, { volume: 0.6 });
    const [playError] = useSound(AUDIOS.sad, { volume: 0.5 });
    const [playComplete] = useSound(AUDIOS.complete, { volume: 0.6 });

    // Sensors
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 100, tolerance: 5 },
        })
    );

    // Hint Logic — Faz 1.8: paylaşılan useHintTimer (GameShell altyapısı)
    const [showHint, dismissHint] = useHintTimer([targetLetter, status]);
    // Faz 3.1 — handleDragStart, sürükleme başlar başlamaz dismissHint() ile
    // showHint'i false'a çeker (bkz. "Interaction resets hint" yorumu); bu
    // yüzden handleDragEnd'de showHint'i DOĞRUDAN okumak neredeyse her zaman
    // false döner. İpucun sürükleme BAŞLARKEN görünür olup olmadığını bir
    // ref'te ayrıca tutuyoruz ki recordSkillAttempt'e doğru değer gitsin.
    const hintWasVisibleRef = useRef(false);
    // startRound her render'da yeniden tanımlanıyor (options/content'e bağımlı);
    // aşağıdaki useEffect onu closure'a hapsetmeden en güncel haliyle
    // çağırabilsin diye bir ref üzerinden erişiliyor.
    const startRoundRef = useRef<() => void>(() => {});

    // 2026-09-14 — content yüklenince, eğer sessionStorage'dan "oyundaydın"
    // bilgisi geldiyse (isPlaying=true) ama henüz bu sekmede hiç round
    // başlatılmadıysa (options boş), Başla ekranını atlayıp otomatik yeni
    // bir round başlatır. Tam round durumu (hangi harf/görsel) SAKLANMAZ —
    // kasıtlı: yeni bir harfle devam eder, ama en azından Başla'ya tekrar
    // basmaya gerek kalmaz.
    useEffect(() => {
        if (isPlaying && content && options.length === 0) {
            startRoundRef.current?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, content]);

    // Loading state — hem oturum hem içerik (Faz 1.4: veritabanından) hazır olmalı
    if (!sessionId || !content) return <div className="flex h-screen items-center justify-center text-softIndigo">Yükleniyor...</div>;

    const { alphabetOrder, letterObjects, letterImages } = content;

    const startRound = async () => {
        // Faz 3.2 — uyarlanabilir zorluk: bu round'un çeldirici sayısı/benzerliği
        // sunucudan (skillAnalytics'in ham göstergelerine göre) tazece sorulur.
        const config = await getAdaptiveRoundConfig();
        setDifficulty(config);

        // Pick Target — 2026-09-14 denetim bulgusu: hedef harf tamamen
        // rastgeleydi, "hangi harflerde zorlanıyor" bilgisi hiç
        // kullanılmıyordu. Ağırlıklı rastgele: zayıf harf varsa bir
        // olasılıkla oradan seçilir (tam öncelik değil — çeşitlilik/
        // tekrar oynanabilirlik korunur, sıkıcı bir döngüye girmez).
        // 2026-09-14 (2. bulgu) — kullanıcı "sürekli aynı harf geliyor"
        // bildirdi: weakLetters çoğu zaman tek elemanlı olduğunda (yalnızca
        // 1 zayıf harf varken) %50 oranı o TEK harfin arka arkaya defalarca
        // çıkmasına yol açıyordu. %25'e düşürüldü — zayıf harf hâlâ normalden
        // sık gelir ama baskın/yorucu olmaz.
        const useWeakLetter = config.weakLetters.length > 0 && Math.random() < 0.25;
        const targetPool = useWeakLetter ? config.weakLetters : alphabetOrder;
        // 2026-09-14 (3. bulgu) — olasılık düşürmek yalnızca İHTİMALİ azaltıyordu,
        // şans eseri hâlâ art arda aynı harf çıkabiliyordu ("hala ard arda aynı
        // harf gelebiliyor" bildirimi). Artık KESİN bir koruma: havuzda birden
        // fazla seçenek varken bir önceki round'un hedefiyle AYNI harf asla
        // ardışık seçilmez (en fazla 10 deneme — sonsuz döngüye karşı güvenlik;
        // tek elemanlı bir havuzda zaten kaçış yoktur, o durumda tekrar kabul
        // edilir).
        let randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
        if (targetPool.length > 1) {
            let attempts = 0;
            while (randomTarget === targetLetter && attempts < 10) {
                randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)];
                attempts++;
            }
        }
        const objects = letterObjects[randomTarget];
        const randomObj = objects[Math.floor(Math.random() * objects.length)];

        setTargetLetter(randomTarget);
        setCurrentObject(randomObj);

        // Pick Distractors
        const count = config.optionCount;
        const distList: string[] = [];
        const used = new Set<string>([randomTarget]);

        const addDistractor = (candidate: string) => {
            if (!used.has(candidate) && alphabetOrder.includes(candidate)) {
                distList.push(candidate);
                used.add(candidate);
                return true;
            }
            return false;
        };

        if (config.distractorType === 'similar') {
            const likes = SIMILAR_MAPPING[randomTarget] || [];
            for (const s of likes) {
                if (distList.length < count - 1) addDistractor(s);
            }
        }

        while (distList.length < count - 1) {
            const rand = alphabetOrder[Math.floor(Math.random() * alphabetOrder.length)];
            addDistractor(rand);
        }

        // Shuffle
        const allOptions = [randomTarget, ...distList].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setStatus('idle');
        setStartTime(Date.now());
        // 2026-09-14 — denetim bulgusu: yalnızca hedef harf sesli okunuyordu,
        // ipucu kelimesi (ör. "Uçak") hiç seslendirilmiyordu — yalnızca
        // ekranda yazı olarak görünüyordu. Çoklu-duyusal pekiştirme için
        // harf sorusu bitince kelime de art arda seslendirilir (await ile
        // sıralı — aynı anda iki TTS sesi çakışmasın diye).
        askLetter(randomTarget)
            .then(() => speak(randomObj.word))
            .catch(() => {});
    };
    startRoundRef.current = startRound;

    // 2026-09-14 — kullanıcı bulgusu: "Başla"ya basınca çift ses geliyordu.
    // Kök neden: burada doğrudan startRound() çağrılıyordu VE isPlaying'i
    // izleyen useEffect (options.length === 0 koşuluyla) de aynı anda
    // kendi startRound()'unu tetikliyordu — iki round paralel başlayıp iki
    // ayrı TTS isteği (soru + kelime, iki harf için) çakışıyordu. Round
    // başlatmayı tek sorumluya (o useEffect) bırakmak yeterli.
    const handleStart = () => {
        setRoundsCompleted(0);
        setIsPlaying(true);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
        hintWasVisibleRef.current = showHint; // Faz 3.1 — dismissHint'ten ÖNCE yakala
        dismissHint(); // Interaction resets hint
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        // Hint timer will naturally restart due to status change if error, or stopped if success

        if (!over) return;

        const droppedLetter = active.data.current?.letter;
        const isCorrect = droppedLetter === targetLetter;
        const reactionTime = Date.now() - startTime;
        // Faz 3.1 — bu round'da ipucu gösterilmiş miydi (şu an tek aşamalı bir
        // ipucu mekaniği var, gelecekte çok aşamalı olursa gerçek bir sayaca
        // dönüşebilir; SkillAttempt.hintsUsed bunun için Int tutuluyor).
        const hintsUsed = hintWasVisibleRef.current ? 1 : 0;

        advanceLevel(isCorrect, targetLetter, reactionTime, difficulty.optionCount, hintsUsed);
        checkCalmingMode(isCorrect);

        if (isCorrect) {
            setStatus('success');
            playSuccess();
            triggerReward();

            setTimeout(() => {
                playComplete();
                setRoundsCompleted((r) => r + 1);
                // Günlük süre bütçesi dolmadıkça oyun kendini kapatmaz —
                // başlangıç ekranı yalnızca ev/geri düğmesiyle ya da bütçe
                // dolunca (isLocked) görünür.
                if (isLocked) {
                    setIsPlaying(false);
                } else {
                    startRound();
                }
            }, 1000);

        } else {
            setStatus('error');
            playError();
            encourageRetry().catch(() => {});
            pushToast({ scope: 'child', kind: 'error', message: 'Tekrar deneyelim' });
            setTimeout(() => setStatus('idle'), 800);
        }
    };

    // --- VIEW: BAŞLANGIÇ EKRANI (Faz 3.2 — 24-düğümlü harita kaldırıldı,
    // uyarlanabilir motorda artık sabit "seviye" kavramı yok) ---
    if (!isPlaying) {
        return (
            <div className="min-h-app bg-papatya-cream flex flex-col items-center justify-center p-8 text-center gap-6">
                <h1 className="text-3xl md:text-5xl font-hand font-bold text-papatya-leaf">
                    Bugünün Macerası
                </h1>
                <p className="text-papatya-ink-soft font-medium">
                    {firstName ? `${firstName} ile Harfleri Keşfet` : 'Harfleri Keşfet'}
                </p>
                <GameIntroCard gameId="letter-hunt" />
                {todayStats && todayStats.total > 0 && (
                    <div className="flex items-center gap-2 bg-papatya-leaf/10 px-5 py-2 rounded-full border border-papatya-leaf/30">
                        <span className="text-papatya-leaf font-bold">
                            Bugün {todayStats.correct}/{todayStats.total} doğru
                        </span>
                    </div>
                )}
                {isLetterHuntLimitReached && !isDayComplete && (
                    <p className="text-papatya-ink-soft text-p-sm max-w-xs">
                        Bugünkü {dailyLetterHuntLimit} turluk Harf Avı hakkın doldu — yarın devam! Diğer oyunlar açık. 🌼
                    </p>
                )}
                <button
                    type="button"
                    onClick={handleStart}
                    disabled={isLocked}
                    className="min-h-tap px-10 py-4 rounded-full bg-papatya-petal text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Başla
                </button>
            </div>
        );
    }

    // GAME BOARD
    return (
        <div className="h-full w-full bg-cream flex flex-col overflow-hidden relative">
            <div className="w-full p-4 lg:p-8 pb-0 shrink-0">
                <GameHud
                    onBack={() => setIsPlaying(false)}
                    center={
                        <div className="bg-papatya-petal/15 px-6 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-papatya-petal/40">
                            {/* 2026-09-14 — kullanıcı bulgusu: "Tur N" oturuma özel bir
                                sayaçtı (kapatıp açınca hep "Tur 1"e dönüyordu), başlangıç
                                ekranındaki kalıcı "Bugün X/Y doğru" ile tutarsız görünüyordu.
                                Artık aynı günlük sayıma bağlı: todayStats oyuna girildiği
                                andaki toplamı sabitler, roundsCompleted o oturumdaki artışı
                                ekler — kapatıp açsan bile sayı geriye sarılmaz. */}
                            <span className="text-papatya-petal-deep font-bold lg:text-lg">
                                {todayStats ? `Bugün ${todayStats.correct + roundsCompleted}. doğru` : `Tur ${roundsCompleted + 1}`}
                            </span>
                        </div>
                    }
                />
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToWindowEdges]}
            >
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    <div className="flex-[4] md:flex-1 flex flex-col items-center justify-center gap-2 md:gap-6 lg:gap-8 p-4 lg:p-8 border-b-4 md:border-b-0 md:border-r-4 border-dashed border-indigo-100 bg-white/40">
                        <HintImage
                            src={currentObject?.img || ''}
                            alt={currentObject?.word || ''}
                        />
                        <TargetFrame
                            id="target-frame"
                            targetLetter={targetLetter}
                            status={status}
                            letterImages={letterImages}
                        />
                        <p className="text-xl md:text-2xl text-softIndigo font-bold">{currentObject?.word}</p>
                    </div>

                    <div className="flex-[6] md:flex-1 flex flex-wrap content-start md:content-center items-center justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-10 p-2 md:p-4 lg:p-8 bg-cream relative overflow-y-auto w-full">
                        {options.map((opt, index) => (
                            <div key={`${opt}-${index}`} className="relative p-2">
                                <DraggableToken
                                    id={`token-${opt}-${index}`}
                                    letter={opt}
                                    disabled={status === 'success'}
                                    highlight={showHint && opt === targetLetter}
                                    letterImages={letterImages}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
                    {activeId ? (
                        <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center text-7xl font-bold text-indigo-600 shadow-2xl opacity-90 border-4 border-indigo-500 overflow-hidden transform scale-110 rotate-3">
                            {letterImages[activeId.split('-')[1]] ? (
                                <ImageWithFallback
                                    src={letterImages[activeId.split('-')[1]]}
                                    alt={activeId.split('-')[1]}
                                    className="w-[80%] h-[80%] object-contain"
                                    fallback={<span>{activeId.split('-')[1]}</span>}
                                />
                            ) : (
                                activeId.split('-')[1]
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
