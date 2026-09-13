'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { GameHud } from '@/components/game/GameHud';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { recordSkillAttempt } from '@/actions/skills';
import letterPaths from '@/data/letterPaths.json';

const LETTERS = Object.keys(letterPaths);

interface Point {
    x: number;
    y: number;
}

/**
 * Faz 2.7 — yazı alıştırması. Harf kılavuzları (bkz. scripts/generateLetterPaths.ts)
 * derleme zamanında opentype.js ile üretilmiş statik SVG path'lerdir —
 * çalışma zamanında font parse edilmez. "Kılavuz üzerinden geçme" modu
 * kılavuzu SVG olarak gösterir, çocuk üstüne çizer; "serbest yazma" modu
 * kılavuzu gizler. Doğru/yanlış yok — başarısızlık yok ilkesi (roadmap
 * Değişmeyen Tasarım İlkeleri).
 */
export function WritingPractice() {
    useGameDayBudget();

    const [letterIndex, setLetterIndex] = useState(0);
    const [mode, setMode] = useState<'trace' | 'free'>('trace');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<Point[][]>([]);
    const isDrawingRef = useRef(false);

    const letter = LETTERS[letterIndex];
    const guide = (letterPaths as Record<string, { path: string; viewBox: string }>)[letter];

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokesRef.current = [];
    };

    useEffect(() => {
        clearCanvas();
    }, [letterIndex, mode]);

    const redraw = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgb(107 135 168)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const stroke of strokesRef.current) {
            if (stroke.length === 0) continue;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (const p of stroke.slice(1)) ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }
    };

    const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        strokesRef.current.push([pointFromEvent(e)]);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        strokesRef.current[strokesRef.current.length - 1].push(pointFromEvent(e));
        redraw();
    };

    const handlePointerUp = () => {
        isDrawingRef.current = false;
    };

    const goToLetter = (nextIndex: number) => {
        recordSkillAttempt('el-yazisi', 'writing-practice', true).catch(() => {});
        setLetterIndex((nextIndex + LETTERS.length) % LETTERS.length);
    };

    return (
        <div className="min-h-screen bg-papatya-cream p-4 flex flex-col gap-4 items-center">
            <GameHud />
            <h1 className="text-p-2xl font-bold text-center">Yazı Alıştırması</h1>

            <div className="flex items-center gap-2 bg-papatya-surface rounded-p-md p-1">
                <button
                    type="button"
                    onClick={() => setMode('trace')}
                    className={`min-h-tap px-4 rounded-p-md font-bold text-p-sm ${
                        mode === 'trace' ? 'bg-papatya-sky text-white' : 'text-papatya-ink-soft'
                    }`}
                >
                    Kılavuzlu
                </button>
                <button
                    type="button"
                    onClick={() => setMode('free')}
                    className={`min-h-tap px-4 rounded-p-md font-bold text-p-sm ${
                        mode === 'free' ? 'bg-papatya-sky text-white' : 'text-papatya-ink-soft'
                    }`}
                >
                    Serbest
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => goToLetter(letterIndex - 1)}
                    className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface rounded-full shadow-sm"
                    aria-label="Önceki harf"
                >
                    <ChevronLeft />
                </button>
                <span className="text-p-3xl font-hand font-bold w-16 text-center">{letter}</span>
                <button
                    type="button"
                    onClick={() => goToLetter(letterIndex + 1)}
                    className="min-w-tap min-h-tap flex items-center justify-center bg-papatya-surface rounded-full shadow-sm"
                    aria-label="Sonraki harf"
                >
                    <ChevronRight />
                </button>
            </div>

            <div className="relative w-full max-w-xs aspect-square bg-papatya-surface rounded-p-lg shadow-lg border-2 border-papatya-rule overflow-hidden">
                {mode === 'trace' && guide && (
                    <svg viewBox={guide.viewBox} className="absolute inset-0 w-full h-full pointer-events-none">
                        <path
                            d={guide.path}
                            transform="scale(1,-1)"
                            fill="none"
                            stroke="rgb(232 179 60)"
                            strokeWidth={6}
                            strokeDasharray="10 8"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    className="absolute inset-0 w-full h-full touch-none"
                />
            </div>

            <button
                type="button"
                onClick={clearCanvas}
                className="min-h-tap px-4 flex items-center gap-2 bg-papatya-surface rounded-p-md font-bold text-papatya-ink-soft"
            >
                <Eraser size={18} /> Temizle
            </button>
        </div>
    );
}
