import React from 'react';
import { APP_NAME, SITE_URL, APP_TAGLINE, APP_DESCRIPTION } from '@/config/brand';

export function JsonLd() {
    const webApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: APP_NAME,
        alternateName: 'Papatyalar Çocuk Özel Eğitim ve Oyun Platformu',
        url: SITE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All (Web, Android, iOS, Windows, macOS)',
        inLanguage: 'tr-TR',
        description: APP_DESCRIPTION,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
        },
        audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
            audienceType: 'Otizmli çocuklar, özel eğitim öğrencileri, ebeveynler ve terapistler',
        },
        featureList: [
            'Türkçe Harf Tanıma ve Fonetik Sesler',
            'AAC Alternatif ve Destekleyici İletişim Panosu',
            'Duyusal Sakinleştirici Mini-Oyunlar (Sakin Balonlar, Neşeli Havuz)',
            'Ebeveyn PIN Korumalı Ekran Süresi Yönetimi',
            'Görsel ve Gölge Eşleştirme',
            'Özel Çizim ve Yazı Pratiği Tahtası',
            'Müzik ve Şarkı Köşesi',
        ],
        author: {
            '@type': 'Organization',
            name: 'Papatyalar',
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Papatyalar nedir ve kimler içindir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Papatyalar; otizm spektrumundaki (ASD) ve özel eğitim alan çocukların Türkçe harf tanıma, sesli sözcük dağarcığı geliştirme, AAC iletişim ve duyusal sakinleşme ihtiyaçlarını destekleyen, reklamsız ve güvenli bir dijital eğitim platformudur.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar AAC iletişim tahtası nasıl çalışır?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AAC İletişim Tahtası, konuşma güçlüğü yaşayan çocukların temel ihtiyaçlarını, duygularını ve taleplerini görsel simgelere dokunarak doğal Türkçe seslendirmeyle ifade etmelerini sağlar.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar platformunda ekran süresi ve güvenlik nasıl yönetilir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ebeveynler 4 haneli güvenli PIN ile korunan Ebeveyn Yönetim Alanı üzerinden günlük ekran süresini ve oyun bütçesini (10-60 dakika) kolayca sınırlandırabilir. Süre bittiğinde uygulama çocuğu yormadan sakinleşme ekranına geçer.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar Oyun Dünyası hangi oyunları içerir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Oyun Dünyası; su fiziğiyle sakinleştiren Neşeli Havuz, ritim ve zamanlama geliştiren Neşeli Kurbağa, hedefleme odaklı Sapanla Papatya ve rahatlatıcı Sakin Balonlar mini-oyunlarını içerir.',
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
