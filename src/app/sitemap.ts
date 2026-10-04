import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/brand';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const routes = [
        { path: '', priority: 1.0, changeFrequency: 'daily' as const },
        { path: '/giris', priority: 0.8, changeFrequency: 'monthly' as const },
        { path: '/games/fun-hub', priority: 0.95, changeFrequency: 'daily' as const },
        { path: '/games/fun-hub/bubble-pop', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/games/fun-hub/water-pool', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/games/fun-hub/frog-jump', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/games/fun-hub/slingshot', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/games/letter-hunt', priority: 0.95, changeFrequency: 'weekly' as const },
        { path: '/games/magic-words', priority: 0.9, changeFrequency: 'weekly' as const },
        { path: '/games/memory-match', priority: 0.85, changeFrequency: 'weekly' as const },
        { path: '/games/visual-match', priority: 0.85, changeFrequency: 'weekly' as const },
        { path: '/games/family-album', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/games/camera-character', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/aac-board', priority: 0.95, changeFrequency: 'weekly' as const },
        { path: '/drawing-board', priority: 0.85, changeFrequency: 'weekly' as const },
        { path: '/writing-practice', priority: 0.85, changeFrequency: 'weekly' as const },
        { path: '/music-corner', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/cartoon', priority: 0.8, changeFrequency: 'weekly' as const },
    ];

    return routes.map((r) => ({
        url: `${SITE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));
}
