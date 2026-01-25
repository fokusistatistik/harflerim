import Link from 'next/link';
import { Play, BookOpen, Star } from 'lucide-react';
import { getDailySession } from '@/actions/game';
import { GameInitializer } from '@/components/game/GameInitializer';

export default async function Home() {
    const session = await getDailySession('letter-hunt');

    return (
        <main className="min-h-screen bg-cream flex flex-col items-center justify-start p-4 pt-24 md:pt-32 relative overflow-hidden">
            <GameInitializer state={session} />

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce delay-700">A</div>
                <div className="absolute bottom-20 right-20 text-8xl opacity-20 animate-bounce delay-1000">B</div>
                <div className="absolute top-1/2 right-10 text-7xl opacity-20 animate-bounce delay-300">C</div>
            </div>

            {/* Hero Section */}
            <div className="z-10 flex flex-col items-center gap-6 max-w-6xl w-full px-4">

                {/* Melike Avatar */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 animate-float">
                    <img
                        src="https://static.fokusistatistik.com/melike/melike.png"
                        alt="Melike"
                        className="w-full h-full object-cover rounded-full border-8 border-white shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
                        <Star className="text-white fill-white" size={32} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-hand font-bold text-softIndigo text-center leading-tight">
                    Melike'nin Oyun Sandığı
                    <br />
                    <span className="text-2xl md:text-3xl text-gray-500 font-sans font-normal">Hoş Geldin Melike!</span>
                </h1>

                {/* Menu Grid Container */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">

                    {/* Daily Game Card */}
                    <Link
                        href="/games/letter-hunt"
                        className="group relative bg-white p-1 rounded-3xl transition-transform hover:scale-105 active:scale-95 aspect-square"
                    >
                        <div className="relative bg-white border-4 border-indigo-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-4 shadow-xl hover:border-indigo-300 group-hover:shadow-2xl transition-all h-full">
                            <div className="w-20 h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <img
                                    src="https://static.fokusistatistik.com/melike/harfler/harf_m.png"
                                    alt="Harf Avı Icon"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                />
                            </div>
                            <div className="flex flex-col items-center text-center w-full px-2">
                                <span className="text-lg md:text-xl font-bold text-gray-800 leading-tight">Harf Avı</span>
                                <span className="text-xs text-gray-400">Günlük Görev</span>
                            </div>
                        </div>
                    </Link>

                    {/* Placeholder Game 2 */}
                    {/* Magic Words Game Card */}
                    <Link
                        href="/games/magic-words"
                        className="group relative bg-white p-1 rounded-3xl transition-transform hover:scale-105 active:scale-95 aspect-square"
                    >
                        <div className="relative bg-white border-4 border-purple-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-4 shadow-xl hover:border-purple-300 group-hover:shadow-2xl transition-all h-full">
                            <div className="w-20 h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                {/* Using Mic icon since no image provided for game icon yet, or use general game asset */}
                                <div className="bg-purple-100 p-4 rounded-full text-purple-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center w-full px-2">
                                <span className="text-lg md:text-xl font-bold text-gray-800 leading-tight">Sihirli Kelimeler</span>
                                <span className="text-xs text-purple-400">Sesli Oyun</span>
                            </div>
                        </div>
                    </Link>

                    {/* Memory Match Game Card */}
                    <Link
                        href="/games/memory-match"
                        className="group relative bg-white p-1 rounded-3xl transition-transform hover:scale-105 active:scale-95 aspect-square"
                    >
                        <div className="relative bg-white border-4 border-teal-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-4 shadow-xl hover:border-teal-300 group-hover:shadow-2xl transition-all h-full">
                            <div className="w-20 h-20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                <div className="bg-teal-100 p-4 rounded-full text-teal-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><rect width="8" height="8" x="7" y="7" rx="1" /></svg>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center w-full px-2">
                                <span className="text-lg md:text-xl font-bold text-gray-800 leading-tight">Hafıza Kartları</span>
                                <span className="text-xs text-teal-400">Eşleştirme</span>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </main>
    );
}
