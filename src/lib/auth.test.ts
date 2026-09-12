import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('hashPassword / verifyPassword', () => {
    it('hashes a password so it is not stored as plain text', async () => {
        const hash = await hashPassword('1234');
        expect(hash).not.toBe('1234');
        expect(hash.startsWith('$2')).toBe(true); // bcrypt hash prefix
    });

    it('accepts the correct password', async () => {
        const hash = await hashPassword('1234');
        expect(await verifyPassword('1234', hash)).toBe(true);
    });

    it('rejects an incorrect password', async () => {
        const hash = await hashPassword('1234');
        expect(await verifyPassword('9999', hash)).toBe(false);
    });
});
