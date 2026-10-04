import React from 'react';
import { APP_NAME, SITE_URL, APP_TAGLINE, APP_DESCRIPTION, AUTISM_ENTITIES } from '@/config/brand';

export function JsonLd() {
    const webApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': ['WebApplication', 'EducationalApplication'],
        name: APP_NAME,
        alternateName: [
            'Papatyalar',
            'Papatyalar Özel Eğitim ve İletişim Platformu',
            'Papatyalar Otizm Eğitim Uygulaması',
            'Papatyalar AAC İletişim Panosu',
        ],
        headline: APP_TAGLINE,
        url: SITE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All (Web, Android, iOS, Windows, macOS, ChromeOS)',
        inLanguage: 'tr-TR',
        description: APP_DESCRIPTION,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
        },
        accessibilityFeature: [
            'alternativeText',
            'highContrastDisplay',
            'structuralNavigation',
            'audioDescription',
            'synchronizedAudioText',
            'largePrint',
        ],
        accessibilityHazard: [
            'noFlashingHazard',
            'noMotionSimulationHazard',
            'noSoundHazard',
        ],
        accessibilityControl: [
            'fullTouchControl',
            'fullMouseControl',
            'voiceInput',
        ],
        about: [
            {
                '@type': 'Thing',
                name: AUTISM_ENTITIES.autismSpectrum.name,
                sameAs: [AUTISM_ENTITIES.autismSpectrum.sameAs, AUTISM_ENTITIES.autismSpectrum.wikidata],
            },
            {
                '@type': 'Thing',
                name: AUTISM_ENTITIES.aacCommunication.name,
                sameAs: [AUTISM_ENTITIES.aacCommunication.sameAs, AUTISM_ENTITIES.aacCommunication.wikidata],
            },
            {
                '@type': 'Thing',
                name: AUTISM_ENTITIES.specialEducation.name,
                sameAs: [AUTISM_ENTITIES.specialEducation.sameAs, AUTISM_ENTITIES.specialEducation.wikidata],
            },
            {
                '@type': 'Thing',
                name: AUTISM_ENTITIES.sensoryIntegration.name,
                sameAs: [AUTISM_ENTITIES.sensoryIntegration.sameAs, AUTISM_ENTITIES.sensoryIntegration.wikidata],
            },
        ],
        audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
            audienceType: [
                'Otizm Spektrum Bozukluğu (OSB) olan çocuklar',
                'Atipik otizm ve Asperger sendromlu çocuklar',
                'Konuşma gecikmesi yaşayan çocuklar',
                'Özel eğitim öğretmenleri ve gölge öğretmenler',
                'Dil ve konuşma terapistleri (DKT)',
                'Özel gereksinimli çocuk ebeveynleri',
            ],
        },
        teaches: [
            'Türkçe fonetik harf sesleri ve harf tanıma',
            'Alternatif ve Destekleyici İletişim (AAC) sembol kullanımı',
            'Duyguları, istekleri ve temel ihtiyaçları ifade etme',
            'El-göz koordinasyonu ve uzamsal hedefleme',
            'Duyusal sakinleşme ve regülasyon',
            'Görsel hafıza ve dikkat odaklama',
            'Noktalı kılavuz üzerinden harf yazma ve çizim',
            'Sosyal bağ kurma ve aile bireylerini tanıma',
        ],
        featureList: [
            'Türkçe Harf Avı (Fonetik sesler, görsel ipuçları ve pekiştireçler)',
            'AAC İletişim Tahtası (Görsel semboller ve doğal Türkçe seslendirme)',
            'Sihirli Kelimeler (Mikrofonla konuşma terapisi pratiği)',
            'Oyun Dünyası (Neşeli Havuz su fiziği, Neşeli Kurbağa ritim, Sapanla Papatya hedefleme, Sakin Balonlar)',
            'Duyu Dostu Tasarım (Pastel tonlar, ani ses/flaş içermeyen sakinleştirici arayüz)',
            'Ebeveyn PIN Korumalı Ekran Süresi ve Oyun Bütçesi Yönetimi (10-60 dk)',
            'Gölge ve Görsel Eşleştirme (Sürükle-bırak motor beceri)',
            'Aile Albümü (Gerçek fotoğraflar ve aile ses kayıtlarıyla bağ kurma)',
            'PWA Desteği (Mobil ve masaüstünde uygulama gibi kurulabilir, hızlı ve çevrimdışı önbellekleme)',
        ],
        author: {
            '@type': 'Organization',
            name: APP_NAME,
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
                name: 'Otizmli çocuklar için en iyi Türkçe eğitim ve iletişim uygulaması hangisidir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Papatyalar; otizm spektrumundaki (OSB) çocukların bilişsel, duyusal ve dil gelişim ihtiyaçlarına özel tasarlanmış öncü Türkçe eğitim platformudur. Fonetik harf tanıma, AAC alternatif iletişim tahtası, duyu dostu sakinleştirici mini-oyunlar ve reklamsız ebeveyn denetimini tek bir güvenli ortamda sunar.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar AAC iletişim tahtası konuşma güçlüğü olan çocuklara nasıl yardımcı olur?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Papatyalar AAC İletişim Tahtası, konuşamayan veya konuşma gecikmesi yaşayan çocukların su, yemek, tuvalet, duygular ve oyun gibi günlük isteklerini görsel sembollere dokunarak berrak Türkçe seslendirme ile aktarmasını sağlar. Bu sayede çocuğun iletişim engeline bağlı öfke nöbetleri ve kaygısı azalır.',
                },
            },
            {
                '@type': 'Question',
                name: 'Otizmde duyusal aşırı yüklenmeyi (overstimulation) önleyen tasarım ilkeleri nelerdir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Papatyalar, duyusal hassasiyeti olan çocuklar için özel olarak tasarlanmıştır: Parlak neon renkler yerine pastel krem ve yumuşak tonlar kullanılır, ani yüksek sesler ve patlama efektleri bulunmaz, hareket azaltma (reduce motion) seçeneği mevcuttur ve reklam veya yönlendirici pop-up pencereler tamamen engellenmiştir.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar platformunda ekran süresi ve çocuk güvenliği nasıl sağlanır?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ebeveynler 4 haneli PIN koduyla korunan Ebeveyn Yönetim Alanı üzerinden çocuğun günlük toplam ekran süresini ve oyun dünyası süresini 10 ile 60 dakika arasında sınırlandırabilir. Süre dolduğunda uygulama sert bir kapanış yerine şefkatli bir mesajla sakin bir dinlenme ekranına geçer.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar Harf Avı otizmli çocuklara okuma yazmayı nasıl öğretir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Harf Avı modülü, harfleri soyut ezber yerine ses temelli (fonetik) yaklaşımla, günlük hayattan tanıdık nesneler ve seslerle ilişkilendirerek öğretir. Hata yapıldığında cezalandırıcı uyarılar yerine pozitif yönlendirme ve teşvik kullanılır.',
                },
            },
            {
                '@type': 'Question',
                name: 'Papatyalar çevrimdışı (internetsiz) veya tabletlerde çalışır mı?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Evet. Modern Progressive Web App (PWA) mimarisi sayesinde Papatyalar; iPad, Android tabletler, akıllı telefonlar ve bilgisayarlara ana ekrana uygulama olarak eklenebilir. Gelişmiş önbellekleme ile internet bağlantısı kesilse dahi kesintisiz çalışmaya devam eder.',
                },
            },
            {
                '@type': 'Question',
                name: 'Aile üyelerini ses ve fotoğrafla kaydetmek otizmli çocuğa ne kazandırır?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Papatyalar Aile Albümü modülü, anne, baba, kardeşler ve terapistlerin gerçek fotoğrafları ile kendi ses kayıtlarını eşleştirir. Bu özellik, çocuğun yüz tanıma, sosyal bağ kurma ve güven duygusunu somutlaştırarak duygusal regülasyona katkı sunar.',
                },
            },
            {
                '@type': 'Question',
                name: 'Oyun Dünyası mini oyunları duyu bütünleme ve el-göz koordinasyonunu nasıl geliştirir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Neşeli Havuz gerçekçi su dalgaları ve yüzen nesnelerle sakinleştirici dokunma deneyimi yaşatır; Neşeli Kurbağa ritim ve zamanlama refleksini artırır; Sapanla Papatya hedefleme ve uzamsal algıyı pekiştirir; Sakin Balonlar ise yavaş uçan balonlarla görsel takip ve çıkartma koleksiyonu motivasyonu sağlar.',
                },
            },
        ],
    };

    const breadcrumbsSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Ana Sayfa',
                item: SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Harf Avı',
                item: `${SITE_URL}/games/letter-hunt`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'AAC İletişim Tahtası',
                item: `${SITE_URL}/aac-board`,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: 'Oyun Dünyası',
                item: `${SITE_URL}/games/fun-hub`,
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
            />
        </>
    );
}
