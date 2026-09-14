import { CameraCharacter } from '@/components/character/CameraCharacter';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';

/**
 * Faz 3.4 — kanıtlayıcı entegrasyon noktası. Kamera ayarı (Ebeveyn Alanı →
 * Duyusal Ayarlar) kapalıysa karakter sakin duruşunda kalır, kamera hiç
 * istenmez. Gerçek kamera/landmark davranışı bu sayfada, gerçek bir
 * tarayıcıda denenmelidir (bu ortamda otomatik test edilemedi).
 */
export default function CameraCharacterPage() {
    return (
        <main className="min-h-screen bg-papatya-cream flex flex-col items-center justify-center p-8 gap-6 text-center">
            <div className="absolute top-20 left-4 right-4">
                <GameHud />
            </div>
            <h1 className="text-2xl md:text-3xl font-hand font-bold text-papatya-leaf">Papatya Seninle Hareket Ediyor</h1>
            <p className="text-papatya-ink-soft max-w-md">
                Kamera ayarı ebeveyn panelinden açıksa karakter senin hareketlerini takip eder. Kapalıysa sakin duruşunda bekler.
            </p>
            <GameIntroCard gameId="camera-character" />
            <CameraCharacter />
        </main>
    );
}
