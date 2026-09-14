'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { listSongs, reportSongPlay, type SongData } from '@/actions/music';

declare global {
    interface Window {
        YT?: {
            Player: new (
                el: HTMLElement | string,
                options: {
                    videoId: string;
                    playerVars?: Record<string, number>;
                    events?: {
                        onStateChange?: (event: { data: number }) => void;
                    };
                }
            ) => { destroy: () => void };
            PlayerState: { ENDED: number };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

/**
 * Faz 2.3 — Müzik köşesi. Reklamsız/önerisiz kapalı bir oynatıcı: her şarkı
 * bittiğinde (ENDED) sakin bir kapanışla listeye döner, otomatik sonraki
 * şarkı YOKTUR. Genel günlük ekran bütçesine (useGameDayBudget, DailyUsage)
 * katkı yapar; gün tamamlanınca zaten global DayComplete devreye girer.
 */
export function MusicCorner() {
    useGameDayBudget();

    const [songs, setSongs] = useState<SongData[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [activeSong, setActiveSong] = useState<SongData | null>(null);
    const [apiReady, setApiReady] = useState(false);

    const playerRef = useRef<{ destroy: () => void } | null>(null);
    const playerContainerRef = useRef<HTMLDivElement | null>(null);

    const refresh = () => {
        listSongs().then((result) => {
            setSongs(result);
            setLoaded(true);
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (window.YT) {
            setApiReady(true);
            return;
        }
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
    }, []);

    useEffect(() => {
        if (!activeSong || !apiReady || !window.YT || !playerContainerRef.current) return;

        const player = new window.YT.Player(playerContainerRef.current, {
            videoId: activeSong.youtubeId,
            playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
            events: {
                onStateChange: (event) => {
                    if (window.YT && event.data === window.YT.PlayerState.ENDED) {
                        reportSongPlay(activeSong.id).then(() => {
                            setActiveSong(null);
                            refresh();
                        });
                    }
                },
            },
        });
        playerRef.current = player;

        return () => {
            player.destroy();
            playerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSong, apiReady]);

    return (
        <div className="min-h-screen bg-papatya-cream p-4 flex flex-col gap-4">
            <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
            <GameHud />

            {activeSong ? (
                <div className="flex flex-col gap-3 items-center">
                    <h2 className="text-p-lg font-bold text-center">{activeSong.title}</h2>
                    <div className="w-full max-w-2xl aspect-video rounded-p-lg overflow-hidden shadow-lg">
                        <div ref={playerContainerRef} className="w-full h-full" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setActiveSong(null)}
                        className="min-h-tap px-6 bg-papatya-surface rounded-p-md text-papatya-ink-soft font-bold"
                    >
                        Listeye dön
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-p-2xl font-bold text-center">Müzik Köşesi</h1>
                    <div className="flex justify-center">
                        <GameIntroCard gameId="music-corner" variant="banner" />
                    </div>
                    {!loaded ? (
                        <p className="text-center text-papatya-ink-soft">Yükleniyor...</p>
                    ) : songs.length === 0 ? (
                        <p className="text-center text-papatya-ink-soft">
                            Henüz şarkı eklenmedi. Ebeveyn Alanı&apos;ndan bir YouTube linki ekleyebilirsiniz.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {songs.map((song) => {
                                const isLocked = song.playsToday >= song.dailyLoopLimit;
                                return (
                                    <button
                                        key={song.id}
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => setActiveSong(song)}
                                        className="flex flex-col gap-2 bg-papatya-surface rounded-p-lg p-3 shadow-sm disabled:opacity-50 text-left"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={song.thumbnailUrl}
                                            alt={song.title}
                                            className="w-full aspect-video object-cover rounded-p-md"
                                        />
                                        <p className="font-bold text-p-sm line-clamp-2">{song.title}</p>
                                        <p className="text-p-sm text-papatya-ink-soft">
                                            {isLocked
                                                ? 'Bugünkü hakkın doldu'
                                                : `${song.dailyLoopLimit - song.playsToday} hak kaldı`}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
