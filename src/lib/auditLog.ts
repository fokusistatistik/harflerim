import { db } from '@/lib/db';

export const AUDIT_EVENT_TYPES = [
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    // Provisional — henüz karşılığı olan bir özellik yok (Faz 2.1 ebeveyn paneli
    // yazıldıkça buraya bağlanacak). Şimdiden tip güvenliği için tanımlandı.
    'SETTINGS_CHANGED',
    'CONTENT_ADDED',
    'CONTENT_REMOVED',
    'PIN_CHANGED',
    'FAMILY_MEMBER_ADDED',
    'FAMILY_MEMBER_REMOVED',
    'ACCOUNT_DELETION_REQUESTED',
    'ACCOUNT_DELETION_COMPLETED',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

export async function logAudit(
    eventType: AuditEventType,
    userId?: string | null,
    detail?: string
) {
    await db.auditLog.create({
        data: { eventType, userId: userId ?? null, detail },
    });
}
