// Faz 3.4 — MediaPipe Pose Landmarker sonuçlarını basit bir karakter poz
// durumuna çevirir. Bilerek render'dan tamamen bağımsız (saf fonksiyon,
// DOM'a/React'e dokunmaz) — ileride farklı bir karaktere/rig sistemine
// geçilirse bu dosya aynı kalabilir, yalnızca render tarafı değişir.

/** MediaPipe Pose'un 33 landmark'ından bu basit kukla için gereken indeksler. */
const LANDMARK = {
    leftEar: 7,
    rightEar: 8,
    leftShoulder: 11,
    rightShoulder: 12,
    leftElbow: 13,
    rightElbow: 14,
    leftWrist: 15,
    rightWrist: 16,
} as const;

export interface NormalizedPoint {
    x: number;
    y: number;
    visibility?: number;
}

export interface CharacterPose {
    /** Derece — kafa yatay eksene göre ne kadar eğik (kulaklar arası çizgi). */
    headTiltDeg: number;
    /** Derece — omuz çizgisinin yatay eksene göre eğimi (gövde eğimi). */
    bodyLeanDeg: number;
    /** 0 (kol aşağıda) – 1 (kol tam kalkık). */
    leftArmRaise: number;
    rightArmRaise: number;
}

/** Kamera/poz hiç yokken veya güven düşükken kullanılan sakin, nötr duruş. */
export const IDLE_POSE: CharacterPose = {
    headTiltDeg: 0,
    bodyLeanDeg: 0,
    leftArmRaise: 0,
    rightArmRaise: 0,
};

const MIN_VISIBILITY = 0.5;

function angleDeg(a: NormalizedPoint, b: NormalizedPoint): number {
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** shoulder-elbow-wrist zincirinden 0-1 aralığında bir "kol kalkıklığı" türetir — bilek omzun ne kadar üstündeyse o kadar yüksek. */
function armRaiseAmount(shoulder: NormalizedPoint, wrist: NormalizedPoint): number {
    const verticalDiff = shoulder.y - wrist.y; // pozitif = bilek omuzdan yukarıda (görüntü y'si aşağı doğru artar)
    return clamp(verticalDiff / 0.3, 0, 1);
}

function isVisible(point: NormalizedPoint | undefined): point is NormalizedPoint {
    return !!point && (point.visibility ?? 1) >= MIN_VISIBILITY;
}

/**
 * `landmarks`, PoseLandmarkerResult.landmarks[0]'dır (tek kişi varsayılır,
 * bkz. PoseLandmarkerOptions.numPoses=1). Herhangi bir landmark görünür
 * değilse (kamera açısı/ışık) o eksen için IDLE_POSE'daki nötr değere düşer
 * — asla NaN/garip bir poz üretmez.
 */
export function landmarksToCharacterPose(landmarks: NormalizedPoint[]): CharacterPose {
    const leftEar = landmarks[LANDMARK.leftEar];
    const rightEar = landmarks[LANDMARK.rightEar];
    const leftShoulder = landmarks[LANDMARK.leftShoulder];
    const rightShoulder = landmarks[LANDMARK.rightShoulder];
    const leftElbow = landmarks[LANDMARK.leftElbow];
    const rightElbow = landmarks[LANDMARK.rightElbow];
    const leftWrist = landmarks[LANDMARK.leftWrist];
    const rightWrist = landmarks[LANDMARK.rightWrist];

    const headTiltDeg =
        isVisible(leftEar) && isVisible(rightEar) ? clamp(angleDeg(rightEar, leftEar), -45, 45) : IDLE_POSE.headTiltDeg;

    const bodyLeanDeg =
        isVisible(leftShoulder) && isVisible(rightShoulder)
            ? clamp(angleDeg(rightShoulder, leftShoulder), -30, 30)
            : IDLE_POSE.bodyLeanDeg;

    const leftArmRaise =
        isVisible(leftShoulder) && isVisible(leftWrist) ? armRaiseAmount(leftShoulder, leftWrist) : IDLE_POSE.leftArmRaise;

    const rightArmRaise =
        isVisible(rightShoulder) && isVisible(rightWrist)
            ? armRaiseAmount(rightShoulder, rightWrist)
            : IDLE_POSE.rightArmRaise;

    // Dirsek şu an kullanılmıyor (v1 basit kukla yalnızca omuz-bilek ekseni
    // kullanıyor) — ileride dirsek açısı eklenirse leftElbow/rightElbow zaten
    // burada destructure edilmiş durumda.
    void leftElbow;
    void rightElbow;

    return { headTiltDeg, bodyLeanDeg, leftArmRaise, rightArmRaise };
}
