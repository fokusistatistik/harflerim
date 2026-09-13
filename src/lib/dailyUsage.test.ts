import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = {
    dailyUsage: { findUnique: vi.fn(), upsert: vi.fn() },
    userSettings: { findUnique: vi.fn() },
};

vi.mock('@/lib/db', () => ({ db: mockDb }));

const { getDailyUsage, addDailyUsageSeconds } = await import('./dailyUsage');

/**
 * Gerçek Prisma upsert semantiğini taklit eder: satır zaten varsa `update`
 * nesnesi kullanılır ve `undefined` alanlar (ör. completedAt) DB'deki eski
 * değerini korur; satır yoksa `create` nesnesi olduğu gibi kullanılır.
 */
function mockUpsert(rowExists: boolean, existingCompletedAt: Date | null = null) {
    mockDb.dailyUsage.upsert.mockImplementation(({ create, update }: any) => {
        if (!rowExists) {
            return Promise.resolve({ totalSeconds: create.totalSeconds, completedAt: create.completedAt ?? null });
        }
        const completedAt = update.completedAt !== undefined ? update.completedAt : existingCompletedAt;
        return Promise.resolve({ totalSeconds: update.totalSeconds, completedAt: completedAt ?? null });
    });
}

describe('getDailyUsage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns zeroed state when no usage row exists yet, using the settings limit', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue(null);
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1200 });

        const state = await getDailyUsage('user-1');
        expect(state).toEqual({ totalSeconds: 0, dailyScreenLimit: 1200, isDayComplete: false });
    });

    it('falls back to the default 1800s limit when there is no settings row', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue(null);
        mockDb.userSettings.findUnique.mockResolvedValue(null);

        const state = await getDailyUsage('user-1');
        expect(state.dailyScreenLimit).toBe(1800);
    });

    it('reflects an existing, already-completed usage row', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue({ totalSeconds: 2000, completedAt: new Date() });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1800 });

        const state = await getDailyUsage('user-1');
        expect(state).toEqual({ totalSeconds: 2000, dailyScreenLimit: 1800, isDayComplete: true });
    });
});

describe('addDailyUsageSeconds', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('accumulates seconds and stays incomplete while under the limit', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue({ totalSeconds: 100, completedAt: null });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1800 });
        mockUpsert(true, null);

        const state = await addDailyUsageSeconds('user-1', 50);

        expect(state.totalSeconds).toBe(150);
        expect(state.isDayComplete).toBe(false);
        const call = mockDb.dailyUsage.upsert.mock.calls[0][0];
        expect(call.update.completedAt).toBeUndefined();
    });

    it('marks the day complete the moment the total reaches the limit exactly', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue({ totalSeconds: 1790, completedAt: null });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1800 });
        mockUpsert(true, null);

        const state = await addDailyUsageSeconds('user-1', 10);

        expect(state.totalSeconds).toBe(1800);
        expect(state.isDayComplete).toBe(true);
    });

    it('marks the day complete when a single addition overshoots the limit', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue({ totalSeconds: 1000, completedAt: null });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1800 });
        mockUpsert(true, null);

        const state = await addDailyUsageSeconds('user-1', 5000);

        expect(state.isDayComplete).toBe(true);
    });

    it('creates a fresh row (no prior usage today) and completes it in one shot if the addition alone exceeds the limit', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue(null);
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 60 });
        mockUpsert(false);

        const state = await addDailyUsageSeconds('user-1', 90);

        expect(state.totalSeconds).toBe(90);
        expect(state.isDayComplete).toBe(true);
        const call = mockDb.dailyUsage.upsert.mock.calls[0][0];
        expect(call.create.completedAt).toBeInstanceOf(Date);
    });

    it('keeps accumulating seconds once already completed, without touching the original completedAt timestamp', async () => {
        const originalCompletedAt = new Date('2026-01-01T00:00:00Z');
        mockDb.dailyUsage.findUnique.mockResolvedValue({ totalSeconds: 1800, completedAt: originalCompletedAt });
        mockDb.userSettings.findUnique.mockResolvedValue({ dailyScreenLimit: 1800 });
        mockUpsert(true, originalCompletedAt);

        const state = await addDailyUsageSeconds('user-1', 30);

        expect(state.totalSeconds).toBe(1830);
        expect(state.isDayComplete).toBe(true);
        // Zaten tamamlanmışsa completedAt'e dokunulmaz (undefined = Prisma alanı değiştirmez);
        // dönen değer DB'deki orijinal zaman damgası olmalı, yeni bir Date() değil.
        expect(state.dailyScreenLimit).toBe(1800);
        const call = mockDb.dailyUsage.upsert.mock.calls[0][0];
        expect(call.update.completedAt).toBeUndefined();
    });

    it('falls back to the default 1800s limit when there is no settings row', async () => {
        mockDb.dailyUsage.findUnique.mockResolvedValue(null);
        mockDb.userSettings.findUnique.mockResolvedValue(null);
        mockUpsert(false);

        const state = await addDailyUsageSeconds('user-1', 10);

        expect(state.dailyScreenLimit).toBe(1800);
        expect(state.isDayComplete).toBe(false);
    });
});
