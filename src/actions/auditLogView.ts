'use server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface AuditLogEntry {
    id: string;
    eventType: string;
    detail: string | null;
    createdAt: string;
}

const RECENT_LIMIT = 50;

/**
 * 2026-09-13 — audit'te bulundu: `logAudit()` her ayar değişikliğini
 * baştan beri kaydediyordu ama ebeveyn panelinde bunu okuyan hiçbir UI
 * yoktu — "ne değişti" hiçbir yerden görülemiyordu. Yalnızca oturum
 * sahibinin kendi kayıtları, en yeniden en eskiye, son 50 ile sınırlı.
 */
export async function listRecentAuditLog(): Promise<AuditLogEntry[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const entries = await db.auditLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: RECENT_LIMIT,
    });

    return entries.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        detail: e.detail,
        createdAt: e.createdAt.toISOString(),
    }));
}
