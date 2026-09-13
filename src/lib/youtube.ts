const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Faz 2.3 — youtu.be, youtube.com/watch?v= ve youtube.com/shorts/ biçimlerini
 * destekler. Geçersiz/tanınmayan bir link sessizce null döner, çağıran taraf
 * kullanıcıya "geçerli bir YouTube linki değil" der.
 */
export function extractYoutubeId(url: string): string | null {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return null;
    }

    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
        const id = parsed.pathname.slice(1);
        return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname === '/watch') {
            const id = parsed.searchParams.get('v');
            return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
        }
        const shortsMatch = parsed.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (shortsMatch) return shortsMatch[1];
    }

    return null;
}

export interface YoutubeMeta {
    title: string;
    thumbnailUrl: string;
}

/** API anahtarı gerektirmeyen oEmbed uç noktası — yalnızca başlık/kapak için. */
export async function fetchYoutubeMeta(youtubeId: string): Promise<YoutubeMeta | null> {
    try {
        const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
        const res = await fetch(oembedUrl);
        if (!res.ok) return null;

        const data = await res.json();
        if (typeof data.title !== 'string' || typeof data.thumbnail_url !== 'string') return null;

        return { title: data.title, thumbnailUrl: data.thumbnail_url };
    } catch {
        return null;
    }
}
