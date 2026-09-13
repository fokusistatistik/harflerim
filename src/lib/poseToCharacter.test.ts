import { describe, expect, it } from 'vitest';
import { landmarksToCharacterPose, IDLE_POSE, type NormalizedPoint } from './poseToCharacter';

/** 33 nötr nokta oluşturur, sonra testin ihtiyaç duyduğu indeksleri override eder. */
function makeLandmarks(overrides: Record<number, NormalizedPoint>): NormalizedPoint[] {
    const points: NormalizedPoint[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    for (const [index, point] of Object.entries(overrides)) {
        points[Number(index)] = point;
    }
    return points;
}

describe('landmarksToCharacterPose', () => {
    it('returns the idle pose when nothing is visible', () => {
        const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0 }));

        expect(landmarksToCharacterPose(points)).toEqual(IDLE_POSE);
    });

    it('keeps head/body neutral (0deg) when perfectly level', () => {
        const points = makeLandmarks({
            7: { x: 0.6, y: 0.3, visibility: 1 }, // leftEar
            8: { x: 0.4, y: 0.3, visibility: 1 }, // rightEar
            11: { x: 0.6, y: 0.5, visibility: 1 }, // leftShoulder
            12: { x: 0.4, y: 0.5, visibility: 1 }, // rightShoulder
        });

        const pose = landmarksToCharacterPose(points);
        expect(pose.headTiltDeg).toBe(0);
        expect(pose.bodyLeanDeg).toBe(0);
    });

    it('detects a raised left arm (wrist well above shoulder)', () => {
        const points = makeLandmarks({
            11: { x: 0.6, y: 0.5, visibility: 1 }, // leftShoulder
            15: { x: 0.6, y: 0.2, visibility: 1 }, // leftWrist, well above shoulder
        });

        const pose = landmarksToCharacterPose(points);
        expect(pose.leftArmRaise).toBeGreaterThan(0.5);
    });

    it('keeps arm lowered (0) when wrist is below the shoulder', () => {
        const points = makeLandmarks({
            11: { x: 0.6, y: 0.5, visibility: 1 }, // leftShoulder
            15: { x: 0.6, y: 0.9, visibility: 1 }, // leftWrist, below shoulder
        });

        const pose = landmarksToCharacterPose(points);
        expect(pose.leftArmRaise).toBe(0);
    });

    it('falls back to the idle value for an axis whose landmarks are not visible', () => {
        const points = makeLandmarks({
            11: { x: 0.6, y: 0.5, visibility: 1 },
            15: { x: 0.6, y: 0.2, visibility: 0.1 }, // low visibility — should not count
        });

        const pose = landmarksToCharacterPose(points);
        expect(pose.leftArmRaise).toBe(IDLE_POSE.leftArmRaise);
    });

    it('clamps extreme head tilt to +/-45deg', () => {
        const points = makeLandmarks({
            7: { x: 0.9, y: 0.9, visibility: 1 }, // leftEar, extreme diagonal
            8: { x: 0.1, y: 0.1, visibility: 1 }, // rightEar
        });

        const pose = landmarksToCharacterPose(points);
        expect(Math.abs(pose.headTiltDeg)).toBeLessThanOrEqual(45);
    });
});
