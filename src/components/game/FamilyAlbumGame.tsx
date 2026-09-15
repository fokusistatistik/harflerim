'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAudio } from '@/components/AudioProvider';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { useHintTimer } from '@/hooks/useHintTimer';
import { useVoiceConfirm } from '@/hooks/useVoiceConfirm';
import { recordSkillAttempt } from '@/actions/skills';
import { listFamilyMembers, type FamilyMemberData } from '@/actions/familyMembers';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { User as UserIcon } from 'lucide-react';
import { GameHud } from './GameHud';

const OPTIONS_PER_ROUND = 3;

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Faz 2.5 — aile albümü oyunu. Faz 2.2'deki gerçek aile fotoğraflarıyla
 * "bu kim?" eşleştirmesi. Ortak kabuk deseni (Faz 1.8): GameHud,
 * useRewardMoment, useHintTimer, useGameDayBudget — dört oyunla aynı
 * altyapı, kendi ilerleme modeli (seviye merdiveni yok, sürekli tur).
 * Skill katmanına (1.20) `sosyal-tanima` olarak bağlı.
 */
export default function FamilyAlbumGame() {
    const [members, setMembers] = useState<FamilyMemberData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [roundIndex, setRoundIndex] = useState(0);
    const [options, setOptions] = useState<FamilyMemberData[]>([]);
    const [target, setTarget] = useState<FamilyMemberData | null>(null);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isLocked, setIsLocked] = useState(false);

    const dayBudget = useGameDayBudget();
    const triggerReward = useRewardMoment();
    const { speak, encourageRetry } = useAudio();
    const [showHint, dismissHint] = useHintTimer([roundIndex, target?.id], 6000);

    useEffect(() => {
        listFamilyMembers().then((result) => {
            setMembers(result);
            setLoaded(true);
        });
    }, []);

    const startRound = useCallback(
        (index: number, pool: FamilyMemberData[]) => {
            if (pool.length < 2) return;
            const t = pool[index % pool.length];
            const distractors = shuffle(pool.filter((m) => m.id !== t.id)).slice(0, OPTIONS_PER_ROUND - 1);
            setOptions(shuffle([t, ...distractors]));
            setTarget(t);
            setFeedback('idle');
            setIsLocked(false);
            speak('Bu kim?').catch(() => {});
        },
        [speak]
    );

    useEffect(() => {
        if (loaded && members.length >= 2) {
            startRound(0, members);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, members]);

    const handleSelect = (candidate: FamilyMemberData) => {
        if (isLocked || !target || dayBudget?.isDayComplete) return;

        const isMatch = candidate.id === target.id;
        setIsLocked(true);
        dismissHint();
        recordSkillAttempt('sosyal-tanima', 'family-album', isMatch).catch(() => {});

        if (isMatch) {
            setFeedback('correct');
            triggerReward({ message: `Bu ${target.name}!` });
            setTimeout(() => {
                const next = roundIndex + 1;
                setRoundIndex(next);
                startRound(next, members);
            }, 1200);
        } else {
            setFeedback('wrong');
            encourageRetry().catch(() => {});
            setTimeout(() => {
                setFeedback('idle');
                setIsLocked(false);
            }, 900);
        }
    };

    // Faz 2.9 — sözlü onay: doğru ismi söylemek de dokunmakla aynı sonucu
    // verir (kimin konuştuğunu ayırt etmez, bilinçli bir ara adım — bkz.
    // useVoiceConfirm doc-comment'i). Dokunmatik yol HER ZAMAN çalışmaya
    // devam eder; bu yalnızca ek bir alternatif, tek yol değil.
    useVoiceConfirm(
        target?.name ?? null,
        () => {
            if (target) handleSelect(target);
        },
        !isLocked && !!target && !dayBudget?.isDayComplete
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
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-center text-papatya-ink-soft max-w-sm">
                        Bu oyunu oynamak için en az 2 aile bireyi eklemelisiniz. Ebeveyn
                        Alanı&apos;ndaki &quot;Aile Bireyleri&quot; sekmesinden ekleyebilirsiniz.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-app bg-papatya-cream p-4 flex flex-col gap-6">
            <div className="shrink-0">
                <GameHud />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <h1 className="text-p-2xl font-bold text-center">Bu Kim?</h1>
                <GameIntroCard gameId="family-album" variant="banner" />

                {target && (
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
                                                : feedback === 'wrong' && option.id !== target.id
                                                  ? 'bg-papatya-surface text-papatya-ink-soft'
                                                  : isHinted
                                                    ? 'bg-papatya-petal/40 text-papatya-ink'
                                                    : 'bg-papatya-surface text-papatya-ink hover:bg-papatya-petal/20'
                                        } disabled:opacity-70`}
                                    >
                                        {option.name}
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
