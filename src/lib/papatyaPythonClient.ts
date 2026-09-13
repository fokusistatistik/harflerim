// Papatya'nın Faz 3 (Zeka Katmanı) Python servisine bağlanan istemci — nöbetçim'in
// lib/ai-planlayici/nobetcim-optimizer-client.ts deseniyle aynı temel yapı.

export class PapatyaPythonClientHatasi extends Error {
    constructor(
        message: string,
        public readonly httpStatus?: number
    ) {
        super(message);
        this.name = 'PapatyaPythonClientHatasi';
    }
}

const ISTEK_TIMEOUT_MS = 5_000;
const SES_ISTEK_TIMEOUT_MS = 15_000; // TTS/konuşmacı tanıma sesli işlem yaptığı için daha uzun tolerans

function baseUrl(): string {
    const url = process.env.PAPATYA_PYTHON_API_URL;
    if (!url) throw new PapatyaPythonClientHatasi('PAPATYA_PYTHON_API_URL ortam değişkeni ayarlanmamış.');
    return url;
}

function authHeaders(): Record<string, string> {
    const key = process.env.PAPATYA_PYTHON_AUTH_KEY;
    return key ? { 'X-Auth-Key': key } : {};
}

async function withTimeout<T>(timeoutMs: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fn(controller.signal);
    } catch (error) {
        if (error instanceof PapatyaPythonClientHatasi) throw error;
        throw new PapatyaPythonClientHatasi(
            `Papatya Python servisine ulaşılamadı: ${error instanceof Error ? error.message : String(error)}`
        );
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function checkPapatyaPythonHealth(): Promise<{ status: string }> {
    return withTimeout(ISTEK_TIMEOUT_MS, async (signal) => {
        const response = await fetch(`${baseUrl()}/health`, { signal });
        if (!response.ok) {
            throw new PapatyaPythonClientHatasi('Papatya Python servisi sağlıksız yanıt döndü.', response.status);
        }
        return (await response.json()) as { status: string };
    });
}

/** Faz 3.5 — Piper TTS. Metni WAV byte'larına çevirir; önbellekte varsa anında döner. */
export async function fetchTtsAudio(text: string): Promise<ArrayBuffer> {
    return withTimeout(SES_ISTEK_TIMEOUT_MS, async (signal) => {
        const response = await fetch(`${baseUrl()}/tts/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ text }),
            signal,
        });
        if (!response.ok) {
            throw new PapatyaPythonClientHatasi('TTS üretimi başarısız oldu.', response.status);
        }
        return response.arrayBuffer();
    });
}

/** Faz 3.3 — bir aile bireyinin ses örneğinden konuşmacı embedding'i çıkarır, saklar. */
export async function enrollFamilyMemberVoice(familyMemberId: string, audioBytes: Buffer, mimeType: string): Promise<void> {
    return withTimeout(SES_ISTEK_TIMEOUT_MS, async (signal) => {
        const form = new FormData();
        form.set('family_member_id', familyMemberId);
        form.set('audio', new Blob([new Uint8Array(audioBytes)], { type: mimeType }), 'ses.webm');

        const response = await fetch(`${baseUrl()}/speaker/enroll`, {
            method: 'POST',
            headers: authHeaders(),
            body: form,
            signal,
        });
        if (!response.ok) {
            throw new PapatyaPythonClientHatasi('Ses örneği kaydedilemedi.', response.status);
        }
    });
}

export interface SpeakerIdentifyResult {
    familyMemberId: string | null;
    confidence: number;
}

/** Faz 3.3 — gelen sesi kayıtlı aile bireyleriyle karşılaştırır. Eşleşme yoksa familyMemberId null döner (asla yanlış tanıma göstermez). */
export async function identifySpeaker(audioBytes: Buffer, mimeType: string): Promise<SpeakerIdentifyResult> {
    return withTimeout(SES_ISTEK_TIMEOUT_MS, async (signal) => {
        const form = new FormData();
        form.set('audio', new Blob([new Uint8Array(audioBytes)], { type: mimeType }), 'ses.webm');

        const response = await fetch(`${baseUrl()}/speaker/identify`, {
            method: 'POST',
            headers: authHeaders(),
            body: form,
            signal,
        });
        if (!response.ok) {
            throw new PapatyaPythonClientHatasi('Konuşmacı tanıma başarısız oldu.', response.status);
        }
        return (await response.json()) as SpeakerIdentifyResult;
    });
}
