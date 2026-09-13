import tr from '@/locales/tr.json';

type LocaleValue = string | string[] | { [key: string]: LocaleValue };

/**
 * Faz 1.21 — tek Türkçe metin kaynağı. Şimdiye kadar `useTurkishSpeech.ts`
 * gibi bileşenler kendi hardcoded dizilerini tutuyordu, bu da
 * `src/locales/tr.json`'daki (kullanılmayan) içerikle çakışıyordu. Bundan
 * sonra kullanıcıya konuşulan/gösterilen Türkçe metin buradan okunur.
 *
 * Çoklu dile geçiş (Faz 4.3) bu fonksiyonların imzasını bozmadan ikinci bir
 * locale dosyası + basit bir dil seçimiyle eklenebilir — şimdilik yalnızca
 * tr.json var, dil değiştirme mekanizması kapsam dışı.
 */
function resolve(path: string): LocaleValue {
    return path.split('.').reduce<LocaleValue | undefined>((acc, key) => {
        if (acc && typeof acc === 'object' && !Array.isArray(acc)) return acc[key];
        return undefined;
    }, tr as LocaleValue) as LocaleValue;
}

export function t(path: string): string {
    const value = resolve(path);
    if (typeof value !== 'string') {
        throw new Error(`i18n: "${path}" bir dize değil (bkz. src/locales/tr.json)`);
    }
    return value;
}

export function tArray(path: string): string[] {
    const value = resolve(path);
    if (!Array.isArray(value)) {
        throw new Error(`i18n: "${path}" bir dizi değil (bkz. src/locales/tr.json)`);
    }
    return value;
}

/** `{{key}}` biçimli basit çift-parantez interpolasyonu. */
export function interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}
