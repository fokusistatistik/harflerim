'use client';

import { useEffect, useState } from 'react';
import { GameHud } from '@/components/game/GameHud';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { listVideos, type VideoData } from '@/actions/videos';

/**
 * Faz 2.4 (kapsamı daraltılmış) — 2.3'teki kontrollü kabuk deseninin video
 * karşılığı: otomatik sonraki video yok, öneri akışı yok. Native <video>
 * denetimleri (oynat/durdur/sarma) dışında bir "sonraki" veya öneri
 * mekanizması bulunmaz.
 */
export function CartoonPlayer() {
    useGameDayBudget();

    const [videos, setVideos] = useState<VideoData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);

    useEffect(() => {
        listVideos().then((result) => {
            setVideos(result);
            setLoaded(true);
        });
    }, []);

    return (
        <div className="min-h-screen bg-papatya-cream p-4 flex flex-col gap-4">
            <GameHud />

            {activeVideo ? (
                <div className="flex flex-col gap-3 items-center">
                    <h2 className="text-p-lg font-bold text-center">{activeVideo.title}</h2>
                    <video
                        src={activeVideo.filePath}
                        controls
                        autoPlay
                        className="w-full max-w-2xl rounded-p-lg shadow-lg"
                    />
                    <button
                        type="button"
                        onClick={() => setActiveVideo(null)}
                        className="min-h-tap px-6 bg-papatya-surface rounded-p-md text-papatya-ink-soft font-bold"
                    >
                        Listeye dön
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-p-2xl font-bold text-center">Çizgi Filmim</h1>
                    {!loaded ? (
                        <p className="text-center text-papatya-ink-soft">Yükleniyor...</p>
                    ) : videos.length === 0 ? (
                        <p className="text-center text-papatya-ink-soft">
                            Henüz video eklenmedi. Ebeveyn Alanı&apos;ndan bir video yükleyebilirsiniz.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {videos.map((video) => (
                                <button
                                    key={video.id}
                                    type="button"
                                    onClick={() => setActiveVideo(video)}
                                    className="flex flex-col gap-2 bg-papatya-surface rounded-p-lg p-4 shadow-sm text-left items-center"
                                >
                                    <span className="font-bold text-p-base text-center">{video.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
