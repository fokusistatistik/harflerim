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
 * 2026-09-15 (kullanıcı bulgusu) — eski 6sn otomatik görsel ipucu (doğru
 * seçeneğin kendiliğinden renklenmesi) kaldırıldı: artık seçenekler özel ad
 * değil yakınlık gösterdiği için bu otomatik renklenme doğrudan cevabı
 * vermek anlamına geliyordu. Tek ipucu yolu artık manuel "Sesli ipucu"
 * butonu (10sn) — çocuk isterse kullanır, otomatik verilmez.
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
    // 2026-09-15 — kullanıcı bulgusu: eskiden 6sn'de doğru seçenek otomatik
    // renkleniyordu (diğer oyunlardan miras kalan görsel ipucu deseni) —
    // artık seçenekler özel ad değil yakınlık gösterdiği için ("Dede (anne
    // tarafı)" gibi) bu otomatik renklendirme doğrudan cevabı vermek anlamına
    // geliyordu, çocuk hiç düşünmeden görebiliyordu. Kaldırıldı — yalnızca
    // 10sn'deki manuel "Sesli ipucu" butonu kaldı (çocuk isterse kullanır,
    // otomatik verilmez).
    const [showVoiceHintButton, dismissVoiceHintButton] = useHintTimer([target?.id], 10000);
    // 2026-09-15 — kullanıcı bulgusu: sesli ipucu butonuna basılınca cihazın
    // hoparlöründen çıkan "Bu senin annen" sesi mikrofona geri yansıyıp
    // (aynı cihazda hoparlör+mikrofon varsa yankı/geri besleme) yanlışlıkla
    // doğru cevap olarak algılanabilirdi. Çözüm: ipucu konuşurken ve birkaç
    // saniye sonrasında (konuşma bitince mikrofonun hâlâ kısa bir yankı
    // yakalama riski için tampon süre) sözlü onay geçici olarak durdurulur.
    const [isVoiceHintPlaying, setIsVoiceHintPlaying] = useState(false);
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

    const handlePlayVoiceHint = async () => {
        if (!target || isVoiceHintPlaying) return;
        setIsVoiceHintPlaying(true);
        await speak(`Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}`).catch(() => {});
        // Konuşma bitince mikrofonun hâlâ kısa bir yankı yakalama riski için
        // ek bir tampon süre — hoparlörden çıkan sesin mikrofona karışıp
        // yanlışlıkla "doğru cevap" olarak algılanmasını önler.
        setTimeout(() => setIsVoiceHintPlaying(false), 1200);
    };

    const handleSelect = (candidate: FamilyMemberData) => {
        if (isLocked || !target || dayBudget?.isDayComplete || dailyLimit?.isFamilyAlbumLimitReached) return;

        const isMatch = candidate.id === target.id;
        setIsLocked(true);
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

    // 2026-09-15 — kullanıcı isteği: 30sn içinde cevap verilmezse round
    // otomatik geçer. "Yanlış" olarak kaydedilir (kullanıcı kararı) —
    // günlük round sayacına dahil olsun diye, aynı zamanda başarı oranını
    // da etkiler (5 ardışık yanlışta sakinleştirme modu tetiklenebilir,
    // "cevap vermeden geçildi" durumu bilinçli olarak bu şekilde ele alınır).
    // Herhangi bir seçenek özel olarak "yanlış tıklandı" işaretlenmez
    // (wrongPickId null kalır) — çocuk hiçbir şeye dokunmadı.
    const handleTimeout = useCallback(() => {
        if (isLocked || !target || dayBudget?.isDayComplete || dailyLimit?.isFamilyAlbumLimitReached) return;

        setIsLocked(true);
        dismissVoiceHintButton();
        recordSkillAttempt('sosyal-tanima', 'family-album', false).catch(() => {});
        checkCalmingMode(false);
        setFeedback('wrong');
        encourageRetry().catch(() => {});
        setTimeout(() => {
            startRound(members);
        }, 900);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocked, target, dayBudget?.isDayComplete, dailyLimit?.isFamilyAlbumLimitReached, members]);

    // 30sn round süresi — her yeni hedefte sıfırlanır, cevap verilince
    // (handleSelect zaten isLocked'ı true yapar) veya round değişince temizlenir.
    useEffect(() => {
        if (!target || isLocked) return;
        const timer = setTimeout(handleTimeout, 30000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target?.id, isLocked]);

    // Faz 2.9 — sözlü onay: doğru ismi söylemek de dokunmakla aynı sonucu
    // verir (kimin konuştuğunu ayırt etmez, bilinçli bir ara adım — bkz.
    // useVoiceConfirm doc-comment'i). Dokunmatik yol HER ZAMAN çalışmaya
    // devam eder; bu yalnızca ek bir alternatif, tek yol değil.
    const { isListening: isMicListening, isSupported: isMicSupported } = useVoiceConfirm(
        target?.relation ?? null,
        () => {
            if (target) handleSelect(target);
        },
        !isLocked && !!target && !dayBudget?.isDayComplete && !dailyLimit?.isFamilyAlbumLimitReached && !isVoiceHintPlaying
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
                    right={
                        isMicSupported ? (
                            <div
                                className={`flex items-center gap-2 px-3 py-2 lg:px-4 rounded-full font-bold text-p-sm ${
                                    isMicListening ? 'bg-papatya-leaf/15 text-papatya-leaf' : 'bg-papatya-rose/15 text-papatya-rose'
                                }`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${isMicListening ? 'bg-papatya-leaf animate-pulse' : 'bg-papatya-rose'}`} />
                                <span className="hidden sm:inline">{isMicListening ? 'Dinliyor' : 'Bekliyor'}</span>
                            </div>
                        ) : undefined
                    }
                />
            </div>

            <div className="flex-1 flex flex-col items-center gap-4 md:gap-6 overflow-y-auto py-2">
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
                            className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[26rem] xl:h-[26rem] object-cover rounded-p-lg shadow-lg"
                            fallback={
                                <div className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[26rem] xl:h-[26rem] rounded-p-lg shadow-lg bg-papatya-petal/20 flex items-center justify-center">
                                    <UserIcon className="text-papatya-petal-deep" size={64} />
                                </div>
                            }
                        />
                        {/* 2026-09-15 — kullanıcı isteği: sesli destek butonu, 10sn cevapsız kalınca belirir; tıklanınca doğru yakınlığı sesli söyler. Otomatik seslenmez (bilerek) — çocuk isterse kullanır. */}
                        {showVoiceHintButton && !isLocked && (
                            <button
                                type="button"
                                onClick={handlePlayVoiceHint}
                                disabled={isVoiceHintPlaying}
                                className="flex items-center gap-2 min-h-tap px-5 py-2 bg-papatya-sky/15 text-papatya-sky rounded-full font-bold text-p-sm shadow-sm hover:bg-papatya-sky/25 transition-colors disabled:opacity-70"
                                aria-label="Sesli ipucu dinle"
                            >
                                <Volume2 size={18} /> Sesli ipucu
                            </button>
                        )}
                        <div className="flex flex-wrap gap-3 justify-center">
                            {options.map((option) => (
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
                                                : 'bg-papatya-surface text-papatya-ink hover:bg-papatya-petal/20'
                                    } disabled:opacity-70`}
                                >
                                    {option.relation}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
