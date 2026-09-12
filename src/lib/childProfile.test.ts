import { describe, expect, it } from 'vitest';
import {
    parseStringList,
    serializeStringList,
    parseSensoryProfile,
    serializeSensoryProfile,
    isLearningChannel,
    isCommunicationLevel,
} from './childProfile';

describe('childProfile helpers', () => {
    it('parses a valid JSON string list', () => {
        expect(parseStringList('["kedi","gezegenler"]')).toEqual(['kedi', 'gezegenler']);
    });

    it('returns an empty list for null/undefined/malformed input', () => {
        expect(parseStringList(null)).toEqual([]);
        expect(parseStringList(undefined)).toEqual([]);
        expect(parseStringList('{not valid json')).toEqual([]);
        expect(parseStringList('{"not":"an array"}')).toEqual([]);
    });

    it('round-trips a string list through serialize/parse', () => {
        const list = ['kedi', 'gezegenler'];
        expect(parseStringList(serializeStringList(list))).toEqual(list);
    });

    it('parses a valid sensory profile and drops unknown keys/values', () => {
        expect(parseSensoryProfile('{"sound":"high","light":"low","touch":"medium","unknown":"x"}')).toEqual({
            sound: 'high',
            light: 'low',
            touch: 'medium',
        });
        expect(parseSensoryProfile('{"sound":"deafening"}')).toEqual({});
    });

    it('returns an empty sensory profile for null/malformed input', () => {
        expect(parseSensoryProfile(null)).toEqual({});
        expect(parseSensoryProfile('not json')).toEqual({});
    });

    it('round-trips a sensory profile through serialize/parse', () => {
        const profile = { sound: 'high' as const, touch: 'low' as const };
        expect(parseSensoryProfile(serializeSensoryProfile(profile))).toEqual(profile);
    });

    it('validates learning channel and communication level values', () => {
        expect(isLearningChannel('reading')).toBe(true);
        expect(isLearningChannel('telepathy')).toBe(false);
        expect(isLearningChannel(null)).toBe(false);
        expect(isCommunicationLevel('aac')).toBe(true);
        expect(isCommunicationLevel('shouting')).toBe(false);
    });
});
