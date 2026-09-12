/**
 * Çocuk profili alanları (Faz 1.4b) — tanı aracı değil, yalnızca
 * kişiselleştirme verisidir (Klinik Sınır Sözleşmesi'ne tabi).
 *
 * SQLite/Prisma dizi (String[]) veya native enum desteklemediği için
 * (bkz. src/lib/auditLog.ts'deki aynı gerekçe) liste ve sabit-seçenekli
 * alanlar UserSettings'te düz String olarak saklanır; tip güvencesi burada,
 * uygulama katmanında sağlanır.
 */

export const LEARNING_CHANNELS = ['reading', 'listening', 'visual'] as const;
export type LearningChannel = (typeof LEARNING_CHANNELS)[number];

export const COMMUNICATION_LEVELS = ['verbal', 'aac', 'mixed'] as const;
export type CommunicationLevel = (typeof COMMUNICATION_LEVELS)[number];

export const SENSITIVITY_LEVELS = ['low', 'medium', 'high'] as const;
export type SensitivityLevel = (typeof SENSITIVITY_LEVELS)[number];

export interface SensoryProfile {
    sound?: SensitivityLevel;
    light?: SensitivityLevel;
    touch?: SensitivityLevel;
}

/** Boş/geçersiz JSON durumunda sessizce boş dizi döner — bir profil alanı bozuk olsa bile uygulama çökmemeli. */
export function parseStringList(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

export function serializeStringList(list: string[]): string {
    return JSON.stringify(list);
}

export function parseSensoryProfile(raw: string | null | undefined): SensoryProfile {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return {};
        const result: SensoryProfile = {};
        for (const key of ['sound', 'light', 'touch'] as const) {
            if (SENSITIVITY_LEVELS.includes(parsed[key])) result[key] = parsed[key];
        }
        return result;
    } catch {
        return {};
    }
}

export function serializeSensoryProfile(profile: SensoryProfile): string {
    return JSON.stringify(profile);
}

export function isLearningChannel(value: string | null | undefined): value is LearningChannel {
    return !!value && (LEARNING_CHANNELS as readonly string[]).includes(value);
}

export function isCommunicationLevel(value: string | null | undefined): value is CommunicationLevel {
    return !!value && (COMMUNICATION_LEVELS as readonly string[]).includes(value);
}
