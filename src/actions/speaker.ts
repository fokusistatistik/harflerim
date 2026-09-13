'use server';

import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { enrollFamilyMemberVoice, identifySpeaker } from '@/lib/papatyaPythonClient';

/**
 * Faz 3.3 — bir aile bireyinin (Faz 2.2'de kaydedilen) ses örneğinden
 * papatya-python'da bir konuşmacı embedding'i oluşturur. Best-effort: Python
 * servisi o an ayakta değilse veya model kurulu değilse sessizce başarısız
 * olur — aile bireyi eklemek/düzenlemek buna asla bağımlı olmamalı
 * (recordSkillAttempt'teki "ölçüm katmanı oyunu bozmaz" ilkesiyle aynı).
 */
export async function enrollFamilyMemberVoiceSample(familyMemberId: string): Promise<void> {
    try {
        const user = await getCurrentUser();
        if (!user) return;

        const member = await db.familyMember.findFirst({ where: { id: familyMemberId, userId: user.id } });
        if (!member?.voicePath) return;

        const filePath = path.join(process.cwd(), 'public', member.voicePath);
        const audioBytes = await readFile(filePath);
        await enrollFamilyMemberVoice(familyMemberId, audioBytes, 'audio/webm');
    } catch {
        // Best-effort — bkz. yukarıdaki not. Kayıt daha sonra manuel tetiklenebilir.
    }
}

export interface IdentifySpeakerResult {
    familyMember: { id: string; name: string; relation: string } | null;
}

/**
 * Faz 3.3 — çocuğun yaptığı canlı bir ses kaydını kayıtlı aile bireyleriyle
 * karşılaştırır. Roadmap ilkesi: "sistem çocuğu tanımadığı bir seste asla
 * kilitlemez" — bu yüzden HER hata/belirsizlik durumunda sessizce
 * `familyMember: null` döner, hiçbir zaman throw etmez. Çağıran taraf bunun
 * için mutlaka dokunmatik bir alternatif sunmalıdır.
 */
export async function identifySpeakerFromRecording(audioBase64: string): Promise<IdentifySpeakerResult> {
    try {
        const user = await getCurrentUser();
        if (!user) return { familyMember: null };

        const audioBytes = Buffer.from(audioBase64, 'base64');
        const result = await identifySpeaker(audioBytes, 'audio/webm');
        if (!result.familyMemberId) return { familyMember: null };

        const member = await db.familyMember.findFirst({ where: { id: result.familyMemberId, userId: user.id } });
        if (!member) return { familyMember: null };

        return { familyMember: { id: member.id, name: member.name, relation: member.relation } };
    } catch {
        return { familyMember: null };
    }
}
