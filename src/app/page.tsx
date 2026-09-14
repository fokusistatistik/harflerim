import { HomeAvatar } from '@/components/ui/HomeAvatar';
import { getDailySession } from '@/actions/game';
import { GameInitializer } from '@/components/game/GameInitializer';
import { getCurrentUser } from '@/lib/auth';
import { worldName } from '@/config/brand';
import { NavGrid } from '@/components/ui/NavGrid';
import { TodaySummary } from '@/components/ui/TodaySummary';
import { getChildProfile } from '@/actions/childProfile';
import { getInterestIcon } from '@/lib/interestAccent';

export default async function Home() {
    const session = await getDailySession('letter-hunt');
    const user = await getCurrentUser();
    const firstName = user?.firstName ?? '';

    // Faz 2.10 — ilgi alanı aksan katmanı: yalnızca 1.4b'de en az bir ilgi
    // alanı kaydedilmişse gösterilir. Papatya logosu/renk paleti/sekiz
    // yapraklı metafor sabit kalır — bu yalnızca küçük bir dekoratif rozet.
    const profile = await getChildProfile();
    const hasInterest = !!profile?.interests.length;
    const InterestIcon = getInterestIcon(profile?.interests ?? []);

    return (
        <main className="min-h-app bg-cream flex flex-col items-center justify-start p-4 pt-16 md:pt-20 lg:pt-8 relative overflow-hidden">
            <GameInitializer state={session} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce delay-700">A</div>
                <div className="absolute bottom-20 right-20 text-8xl opacity-20 animate-bounce delay-1000">B</div>
                <div className="absolute top-1/2 right-10 text-7xl opacity-20 animate-bounce delay-300">C</div>
            </div>

            {/* Hero Section — 2026-09-13: masaüstünde avatar+başlık yan yana
                (lg:flex-row), üstteki dikey boşluk azaltıldı (kullanıcı UX
                geri bildirimi: "üstteki boşluğu azalt"). */}
            <div className="z-10 flex flex-col items-center gap-4 lg:gap-5 max-w-6xl xl:max-w-7xl w-full px-4">

                <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6">
                    {/* Profil fotoğrafı — kullanıcıya dinamik bağlı (bkz. HomeAvatar) */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-28 lg:h-28 animate-float shrink-0">
                        <HomeAvatar avatarUrl={user?.avatarUrl ?? null} firstName={firstName} />
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/ikonlar/yildiz.png" alt="" className="w-6 h-6" />
                        </div>
                        {hasInterest && (
                            <div className="absolute -top-2 -left-2 bg-papatya-sky p-2 rounded-full shadow-lg">
                                <InterestIcon className="text-white" size={20} />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-5xl font-hand font-bold text-softIndigo text-center lg:text-left leading-tight">
                        {worldName(firstName)}
                        <br />
                        <span className="text-xl md:text-2xl lg:text-2xl text-gray-500 font-sans font-normal">Hoş Geldin {firstName}!</span>
                    </h1>
                </div>

                <TodaySummary />

                {/* Faz 1.18 — navigasyon iskeleti: Faz 1-3'te planlanan tüm alanlar
                    en az bir yuva olarak burada görünür (bkz. src/config/navAreas.ts). */}
                <NavGrid />
            </div>
        </main>
    );
}
