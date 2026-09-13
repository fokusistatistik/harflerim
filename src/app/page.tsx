import { Star } from 'lucide-react';
import { getDailySession } from '@/actions/game';
import { GameInitializer } from '@/components/game/GameInitializer';
import { getCurrentUser } from '@/lib/auth';
import { worldName } from '@/config/brand';
import { NavGrid } from '@/components/ui/NavGrid';
import { TodaySummary } from '@/components/ui/TodaySummary';

export default async function Home() {
    const session = await getDailySession('letter-hunt');
    const user = await getCurrentUser();
    const firstName = user?.firstName ?? '';

    return (
        <main className="min-h-screen bg-cream flex flex-col items-center justify-start p-4 pt-24 md:pt-32 lg:pt-40 relative overflow-hidden">
            <GameInitializer state={session} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce delay-700">A</div>
                <div className="absolute bottom-20 right-20 text-8xl opacity-20 animate-bounce delay-1000">B</div>
                <div className="absolute top-1/2 right-10 text-7xl opacity-20 animate-bounce delay-300">C</div>
            </div>

            {/* Hero Section */}
            <div className="z-10 flex flex-col items-center gap-6 lg:gap-8 max-w-6xl xl:max-w-7xl w-full px-4">

                {/* Melike Avatar */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-float">
                    <img
                        src="https://static.fokusistatistik.com/melike/melike.png"
                        alt={firstName}
                        className="w-full h-full object-cover rounded-full border-8 border-white shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
                        <Star className="text-white fill-white" size={32} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-hand font-bold text-softIndigo text-center leading-tight">
                    {worldName(firstName)}
                    <br />
                    <span className="text-2xl md:text-3xl lg:text-4xl text-gray-500 font-sans font-normal">Hoş Geldin {firstName}!</span>
                </h1>

                <TodaySummary />

                {/* Faz 1.18 — navigasyon iskeleti: Faz 1-3'te planlanan tüm alanlar
                    en az bir yuva olarak burada görünür (bkz. src/config/navAreas.ts). */}
                <NavGrid />
            </div>
        </main>
    );
}
