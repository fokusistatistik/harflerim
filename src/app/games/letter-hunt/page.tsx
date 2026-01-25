import { getDailySession } from '@/actions/game';
import { GameInitializer } from '@/components/game/GameInitializer';
import GameBoard from '@/components/game/GameBoard';

export default async function DailyGamePage() {
    try {
        const session = await getDailySession('letter-hunt');

        return (
            <main className="min-h-screen bg-cream">
                <GameInitializer state={session} />
                <GameBoard />
            </main>
        );
    } catch (e) {
        console.error("Game Load Error:", e);
        return (
            <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-8 text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Hata Oluştu</h1>
                <p className="text-gray-700">Oyun yüklenirken bir sorun oluştu.</p>
                <code className="text-xs bg-gray-100 p-2 rounded mt-4 block">{(e as Error).message}</code>
            </main>
        );
    }
}
