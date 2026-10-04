import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/brand';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/_next/'],
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'Claude-Web',
                    'ClaudeBot',
                    'PerplexityBot',
                    'Googlebot',
                    'Google-Extended',
                    'Bingbot',
                    'Applebot',
                ],
                allow: '/',
                disallow: ['/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
