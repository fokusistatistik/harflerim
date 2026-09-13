'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { getParentPreferences } from '@/actions/parentSettings';
import { landmarksToCharacterPose, IDLE_POSE, type CharacterPose } from '@/lib/poseToCharacter';
import { PapatyaPuppet } from './PapatyaPuppet';

// @mediapipe/tasks-vision'ın npm sürümüyle (package.json) AYNI pin — WASM
// binary'siyle JS API arasında sürüm uyuşmazlığı olmasın diye.
const WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
// Google'ın barındırdığı, en hafif ("lite") Pose Landmarker modeli — düşük
// RAM/CPU önceliği (kullanıcı kararı, 2026-09-13).
const POSE_MODEL_URL =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

type Status = 'idle' | 'loading' | 'running' | 'denied' | 'unavailable';

/**
 * Faz 3.4 — kamera → karakter animasyonu. `cameraEnabled` (ebeveyn ayarı,
 * varsayılan kapalı) true değilse HİÇBİR ŞEY yapmaz — kamera hiç istenmez.
 * MediaPipe Pose tamamen İSTEMCİ TARAFINDA (WASM) çalışır — hiçbir kare
 * papatya-python'a veya başka bir sunucuya gitmez. Video elemanı DOM'da
 * gizlidir; yalnızca landmark koordinatları işlenir, hiçbir yere kaydedilmez.
 */
export function CameraCharacter() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const rafRef = useRef<number | null>(null);
    const [pose, setPose] = useState<CharacterPose>(IDLE_POSE);
    const [status, setStatus] = useState<Status>('idle');

    useEffect(() => {
        let cancelled = false;
        let stream: MediaStream | null = null;

        async function start() {
            const prefs = await getParentPreferences();
            if (!prefs?.cameraEnabled || cancelled) return;

            setStatus('loading');
            try {
                const vision = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
                const landmarker = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: POSE_MODEL_URL },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                });
                if (cancelled) {
                    landmarker.close();
                    return;
                }
                landmarkerRef.current = landmarker;

                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                const video = videoRef.current;
                if (!video) return;
                video.srcObject = stream;
                await video.play();
                setStatus('running');

                const loop = () => {
                    if (cancelled || !landmarkerRef.current || !videoRef.current) return;
                    const result = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
                    if (result.landmarks[0]) {
                        setPose(landmarksToCharacterPose(result.landmarks[0]));
                    }
                    rafRef.current = requestAnimationFrame(loop);
                };
                rafRef.current = requestAnimationFrame(loop);
            } catch (error) {
                if (cancelled) return;
                // Kamera izni reddedildi ya da cihaz/tarayıcı desteklemiyor —
                // roadmap ilkesi: dokunmatik/kamerasız akış her zaman çalışmaya
                // devam etmeli, bu yüzden sessizce IDLE_POSE'a düşülür.
                const isPermissionError = error instanceof DOMException && error.name === 'NotAllowedError';
                setStatus(isPermissionError ? 'denied' : 'unavailable');
            }
        }

        start();

        return () => {
            cancelled = true;
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            landmarkerRef.current?.close();
            landmarkerRef.current = null;
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Kamera akışı EKRANDA HİÇ GÖSTERİLMEZ (roadmap ilkesi — kendi
                görüntüsünü izlemek otizmde kaygı tetikleyebilir). Yalnızca
                landmark işleme için DOM'da, gizli. */}
            <video ref={videoRef} className="hidden" playsInline muted />
            <PapatyaPuppet pose={pose} />
            {status === 'denied' && (
                <p className="text-sm text-papatya-ink-soft">Kamera izni verilmedi — karakter sakin duruşuyla bekliyor.</p>
            )}
            {status === 'unavailable' && (
                <p className="text-sm text-papatya-ink-soft">Kamera şu an kullanılamıyor — karakter sakin duruşuyla bekliyor.</p>
            )}
        </div>
    );
}
