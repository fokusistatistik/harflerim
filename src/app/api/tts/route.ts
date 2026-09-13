import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { fetchTtsAudio } from '@/lib/papatyaPythonClient';

/**
 * Faz 3.5 — tarayıcının doğrudan çağırabileceği tek nokta. papatya-python
 * yalnızca 127.0.0.1'e bağlı ve auth key gerektiriyor (bkz.
 * dokumantasyon/python-altyapisi.md) — bu yüzden istemci doğrudan ona değil,
 * bu Next.js route'una gelir; auth key hiçbir zaman tarayıcıya çıkmaz.
 */
export async function POST(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });

    const { text } = (await request.json().catch(() => ({}))) as { text?: unknown };
    if (typeof text !== 'string' || !text.trim()) {
        return NextResponse.json({ error: 'text gerekli.' }, { status: 400 });
    }

    try {
        const audio = await fetchTtsAudio(text);
        return new NextResponse(audio, { headers: { 'Content-Type': 'audio/wav' } });
    } catch {
        // useTurkishSpeech.ts bu durumda tarayıcı speechSynthesis'ine sessizce düşer.
        return NextResponse.json({ error: 'TTS başarısız oldu.' }, { status: 502 });
    }
}
