'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAudio } from '@/components/AudioProvider';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useHintTimer } from '@/hooks/useHintTimer';
import { useVoiceConfirm } from '@/hooks/useVoiceConfirm';
import { useCalmingModeMonitor } from '@/hooks/useCalmingModeMonitor';
import { recordSkillAttempt } from '@/actions/skills';
import { listFamilyMembers, getFamilyAlbumDailyState, type FamilyMemberData } from '@/actions/familyMembers';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { User as UserIcon, Volume2 } from 'lucide-react';
import { useParentGateStore } from '@/store/parentGateStore';
import { GameHud } from './GameHud';

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Faz 2.5 — aile albümü oyunu. Faz 2.2'deki gerçek aile fotoğraflarıyla
 * "bu kim?" eşleştirmesi. Ortak kabuk deseni (Faz 1.8): GameHud,
 * useRewardMoment, useHintTimer, useGameDayBudget — beş oyunla aynı
 * altyapı, kendi ilerleme modeli (seviye merdiveni yok, sürekli tur).
 * Skill katmanına (1.20) `sosyal-tanima` olarak bağlı.
 *
 * 2026-09-15 (Faz 2.11 denetimi) — diğer üç oyunla eşitlendi: adaptif
 * zorluk (`getAdaptiveFamilyAlbumConfig`, seçenek sayısı sabit 3 değil
 * 2-4 arası), günlük round limiti (`dailyFamilyAlbumLimit`), sakinleştirme
 * modu (`useCalmingModeMonitor`), rastgele hedef seçimi + ardışık aynı
 * hedef koruması (eski `pool[index % pool.length]` sıralı döngüsü yerine).
 *
 * 2026-09-15 (kullanıcı isteği) — seçenekler ve sözlü onay artık ÖZEL AD
 * değil YAKINLIK DERECESİ gösteriyor/dinliyor (okuma-yazma bilmeyen bir
 * çocuk için "Hatice" değil "Babaanne" anlamlı — çocuğun o kişiye
 * seslendiği kelime). Aynı round'da hedefle aynı yakınlığa sahip kişiler
 * çeldirici havuzundan çıkarılır (iki "Amca" aynı anda gösterilmez).
 * Ayrıca 10sn cevapsız kalınca beliren, tıklanınca doğru yakınlığı sesli
 * söyleyen "Sesli ipucu" butonu eklendi (bkz. `seslendirmeler.md` A4).
 */
export default function FamilyAlbumGame() {
    const [members, setMembers] = useState<FamilyMemberData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [options, setOptions] = useState<FamilyMemberData[]>([]);
    const [target, setTarget] = useState<FamilyMemberData | null>(null);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [wrongPickId, setWrongPickId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [dailyLimit, setDailyLimit] = useState<{
        optionCount: number;
        roundsPlayedToday: number;
        dailyFamilyAlbumLimit: number;
        isFamilyAlbumLimitReached: boolean;
    } | null>(null);

    const dayBudget = useGameDayBudget();
    const triggerReward = useRewardMoment();
    const { speak, encourageRetry } = useAudio();
    const checkCalmingMode = useCalmingModeMonitor('sosyal-tanima');
    const [showHint, dismissHint] = useHintTimer([target?.id], 6000);
    // 2026-09-15 — kullanıcı isteği: sesli destek butonu, görsel ipucudan
    // (6sn) biraz daha geç (10sn) beliren ikinci bir kademe — çocuk isterse
    // dokunup doğru yakınlık kelimesini duyabilir, otomatik seslenmez
    // (istenmeyen tekrar/beklenmedik ses otizmli çocuklar için rahatsız
    // edici olabilir, bu yüzden BUTON — otomatik değil).
    const [showVoiceHintButton, dismissVoiceHintButton] = useHintTimer([target?.id], 10000);
    const previousTargetIdRef = useRef<string | null>(null);

    useEffect(() => {
        listFamilyMembers().then((result) => {
            setMembers(result);
            setLoaded(true);
        });
    }, []);

    const startRound = useCallback(async (pool: FamilyMemberData[]) => {
        if (pool.length < 2) return;

        const state = await getFamilyAlbumDailyState().catch(() => null);
        setDailyLimit(state);
        if (state?.isFamilyAlbumLimitReached) return;

        // 2026-09-15 — kullanıcı isteği: oyunda özel ad yerine yakınlık
        // derecesi gösteriliyor/soruluyor (okuma-yazma bilmeyen çocuk için
        // "Hatice" değil "Babaanne" anlamlı). Bu yüzden aynı round'da hedefle
        // AYNI yakınlık etiketine sahip kişiler çeldirici havuzundan
        // çıkarılır — çocuğa asla aynı yazılı iki buton (iki "Amca")
        // gösterilmez. Bunun sonucu: hedef, havuzda en az bir FARKLI
        // yakınlıklı kişi bulunan bir kayıttan seçilmeli — aksi halde round
        // tek seçenekli (anlamsız) olurdu. Tüm kayıtlar aynı yakınlığa
        // sahipse (ör. yalnızca 2 "Amca" varsa) bu havuz boş kalır, o zaman
        // eski davranışa (yakınlık ayrımı yapılmadan) düşülür — round yine
        // de oynanabilir olsun diye.
        const eligibleTargets = pool.filter((m) => pool.some((other) => other.id !== m.id && other.relation !== m.relation));
        const targetPool = eligibleTargets.length > 0 ? eligibleTargets : pool;

        // Rastgele hedef seçimi + ardışık aynı hedef koruması (Gölge
        // Eşleştirme/Harf Avı'ndaki kesin desenin aynısı) — sıralı
        // `pool[index % pool.length]` döngüsü yerine.
        let candidates = shuffle(targetPool);
        if (candidates[0].id === previousTargetIdRef.current && targetPool.length > 1) {
            candidates = [...candidates.slice(1), candidates[0]];
        }
        const t = candidates[0];
        previousTargetIdRef.current = t.id;

        // Çeldiriciler yalnızca hedeften değil, BİRBİRLERİNDEN de farklı
        // yakınlıkta olmalı — aksi halde iki çeldirici aynı etikete sahip
        // olabilir (ör. iki "Amca") ve aynı round'da aynı yazılı iki buton
        // görünürdü. Sırayla seç: her seçilen çeldiricinin yakınlığı,
        // kalan havuzdan da elenir. Yeterli çeşitlilik yoksa (nadir —
        // örn. 3 farklı yakınlıktan fazlası gerekiyor ama havuzda o kadar
        // çeşit yoksa) eldeki kadarıyla devam edilir, round az seçenekle
        // de olsa oynanabilir kalır.
        const optionCount = Math.min(state?.optionCount ?? 2, pool.length);
        const usedRelations = new Set([t.relation]);
        const remainingPool = shuffle(pool.filter((m) => m.id !== t.id));
        const distractors: FamilyMemberData[] = [];
        for (const candidate of remainingPool) {
            if (distractors.length >= optionCount - 1) break;
            if (usedRelations.has(candidate.relation)) continue;
            distractors.push(candidate);
            usedRelations.add(candidate.relation);
        }
        setOptions(shuffle([t, ...distractors]));
        setTarget(t);
        setFeedback('idle');
        setWrongPickId(null);
        setIsLocked(false);
        speak('Bu kim?').catch(() => {});
    }, [speak]);

    useEffect(() => {
        if (loaded && members.length >= 2) {
            startRound(members);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, members]);

    const handleSelect = (candidate: FamilyMemberData) => {
        if (isLocked || !target || dayBudget?.isDayComplete || dailyLimit?.isFamilyAlbumLimitReached) return;

        const isMatch = candidate.id === target.id;
        setIsLocked(true);
        dismissHint();
        dismissVoiceHintButton();
        recordSkillAttempt('sosyal-tanima', 'family-album', isMatch).catch(() => {});
        checkCalmingMode(isMatch);

        if (isMatch) {
            setFeedback('correct');
            triggerReward({ message: `Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}!` });
            setTimeout(() => {
                startRound(members);
            }, 1200);
        } else {
            setFeedback('wrong');
            setWrongPickId(candidate.id);
            encourageRetry().catch(() => {});
            setTimeout(() => {
                setFeedback('idle');
                setWrongPickId(null);
                setIsLocked(false);
            }, 900);
        }
    };

    // Faz 2.9 — sözlü onay: doğru ismi söylemek de dokunmakla aynı sonucu
    // verir (kimin konuştuğunu ayırt etmez, bilinçli bir ara adım — bkz.
    // useVoiceConfirm doc-comment'i). Dokunmatik yol HER ZAMAN çalışmaya
    // devam eder; bu yalnızca ek bir alternatif, tek yol değil.
    useVoiceConfirm(
        target?.relation ?? null,
        () => {
            if (target) handleSelect(target);
        },
        !isLocked && !!target && !dayBudget?.isDayComplete && !dailyLimit?.isFamilyAlbumLimitReached
    );

    if (!loaded) {
        return (
            <div className="min-h-app flex items-center justify-center bg-papatya-cream">
                <p className="text-papatya-ink-soft">Yükleniyor...</p>
            </div>
        );
    }

    if (members.length < 2) {
        return (
            <div className="min-h-app bg-papatya-cream p-4 flex flex-col gap-4">
                <GameHud />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-center text-papatya-ink-soft max-w-sm">
                        Bu oyunu oynamak için en az 2 aile bireyi eklemelisiniz. Ebeveyn
                        Alanı&apos;ndaki &quot;Aile Bireyleri&quot; sekmesinden ekleyebilirsiniz.
                    </p>
                    <button
                        type="button"
                        onClick={() => useParentGateStore.getState().openPinPrompt('aile')}
                        className="min-h-tap px-6 py-3 bg-papatya-sky text-white font-bold rounded-p-md shadow-sm"
                    >
                        Aile Bireyi Ekle
                    </button>
                </div>
            </div>
        );
    }

    const isLimitReached = !!dailyLimit?.isFamilyAlbumLimitReached;

    return (
        <div className="h-app bg-papatya-cream p-4 flex flex-col gap-6 overflow-hidden">
            <div className="shrink-0">
                <GameHud
                    center={
                        dailyLimit && !isLimitReached ? (
                            <div className="bg-papatya-petal/15 px-6 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-papatya-petal/40">
                                <span className="text-papatya-petal-deep font-bold text-p-sm lg:text-p-base whitespace-nowrap">
                                    Bugün {dailyLimit.roundsPlayedToday}/{dailyLimit.dailyFamilyAlbumLimit}
                                </span>
                            </div>
                        ) : undefined
                    }
                />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-y-auto py-2">
                <h1 className="text-p-2xl font-bold text-center">Bu Kim?</h1>
                <GameIntroCard gameId="family-album" variant="banner" />

                {isLimitReached ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-p-lg font-bold text-papatya-ink">Bugünkü {dailyLimit?.dailyFamilyAlbumLimit} turluk hakkın doldu</p>
                        <p className="text-p-base text-papatya-ink-soft">Yarın devam edebilirsin!</p>
                    </div>
                ) : target && (
                    <div className="flex flex-col items-center gap-4">
                        {/* Doğru cevap zaten useRewardMoment'ın kendi toast'ıyla (role="status") duyuruluyor — burada yalnızca yanlış cevap için ek bir ekran okuyucu duyurusu gerekiyor. */}
                        <span role="status" aria-live="polite" className="sr-only">
                            {feedback === 'wrong' ? 'Tekrar deneyelim' : ''}
                        </span>
                        <ImageWithFallback
                            src={target.photoPath}
                            alt="Aile bireyi"
                            className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 object-cover rounded-p-lg shadow-lg"
                            fallback={
                                <div className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-p-lg shadow-lg bg-papatya-petal/20 flex items-center justify-center">
                                    <UserIcon className="text-papatya-petal-deep" size={64} />
                                </div>
                            }
                        />
                        {/* 2026-09-15 — kullanıcı isteği: sesli destek butonu, 10sn cevapsız kalınca belirir; tıklanınca doğru yakınlığı sesli söyler. Otomatik seslenmez (bilerek) — çocuk isterse kullanır. */}
                        {showVoiceHintButton && !isLocked && (
                            <button
                                type="button"
                                onClick={() => speak(`Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}`).catch(() => {})}
                                className="flex items-center gap-2 min-h-tap px-5 py-2 bg-papatya-sky/15 text-papatya-sky rounded-full font-bold text-p-sm shadow-sm hover:bg-papatya-sky/25 transition-colors"
                                aria-label="Sesli ipucu dinle"
                            >
                                <Volume2 size={18} /> Sesli ipucu
                            </button>
                        )}
                        <div className="flex flex-wrap gap-3 justify-center">
                            {options.map((option) => {
                                const isHinted = showHint && option.id === target.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        disabled={isLocked}
                                        className={`min-h-tap px-6 py-3 rounded-p-md font-bold text-p-base shadow-sm transition-colors ${
                                            feedback === 'correct' && option.id === target.id
                                                ? 'bg-papatya-leaf text-white'
                                                : feedback === 'wrong' && option.id === wrongPickId
                                                  ? 'bg-papatya-rose/20 text-papatya-rose border-2 border-papatya-rose/50'
                                                  : feedback === 'wrong' && option.id !== target.id
                                                    ? 'bg-papatya-surface text-papatya-ink-soft'
                                                    : isHinted
                                                      ? 'bg-papatya-petal/40 text-papatya-ink'
                                                      : 'bg-papatya-surface text-papatya-ink hover:bg-papatya-petal/20'
                                        } disabled:opacity-70`}
                                    >
                                        {option.relation}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
