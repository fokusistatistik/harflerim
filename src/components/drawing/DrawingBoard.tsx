'use client';

import { useEffect, useRef, useState } from 'react';
import { Undo2, Trash2, Save } from 'lucide-react';
import { GameHud } from '@/components/game/GameHud';
import { GameIntroCard } from '@/components/ui/GameIntroCard';
import { useGameDayBudget } from '@/hooks/useGameDayBudget';
import { useRewardMoment } from '@/hooks/useRewardMoment';
import { listDrawings, saveDrawing, type DrawingData } from '@/actions/drawings';

interface Point {
    x: number;
    y: number;
}

/** Sınırlı ve sakin bir palet — papatya renk tokenlerinden, göz yormayan tonlar. */
const PALETTE = [
    { name: 'mürekkep', value: 'rgb(42 39 34)' },
    { name: 'gök', value: 'rgb(107 135 168)' },
    { name: 'yaprak', value: 'rgb(95 122 82)' },
    { name: 'gül', value: 'rgb(196 117 106)' },
    { name: 'papatya', value: 'rgb(232 179 60)' },
];

const LINE_WIDTH = 12;

/**
 * Faz 2.6 — çizim tahtası. Native canvas + pointer events (harici çizim
 * kütüphanesi yok). Tek adımlık geri alma: her vuruş (stroke) bir dizi
 * nokta olarak tutulur, undo son vuruşu atıp tuvali baştan yeniden çizer.
 * Kaydedilen PNG'ler yerel dosya sistemine gider (bkz. mediaStorage.ts).
 */
export function DrawingBoard() {
    useGameDayBudget();
    const triggerReward = useRewardMoment();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<{ color: string; points: Point[] }[]>([]);
    const isDrawingRef = useRef(false);

    const [color, setColor] = useState(PALETTE[0].value);
    const [gallery, setGallery] = useState<DrawingData[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const refreshGallery = () => {
        listDrawings().then(setGallery);
    };

    useEffect(() => {
        refreshGallery();
    }, []);

    const getContext = () => canvasRef.current?.getContext('2d') ?? null;

    const redrawAll = () => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;

        ctx.fillStyle = '#FBF8EF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const stroke of strokesRef.current) {
            if (stroke.points.length === 0) continue;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = LINE_WIDTH;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (const point of stroke.points.slice(1)) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    };

    useEffect(() => {
        redrawAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        strokesRef.current.push({ color, points: [pointFromEvent(e)] });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const current = strokesRef.current[strokesRef.current.length - 1];
        current.points.push(pointFromEvent(e));
        redrawAll();
    };

    const handlePointerUp = () => {
        isDrawingRef.current = false;
    };

    const handleUndo = () => {
        strokesRef.current.pop();
        redrawAll();
    };

    const handleClear = () => {
        strokesRef.current = [];
        redrawAll();
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas || strokesRef.current.length === 0) return;

        setIsSaving(true);
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setIsSaving(false);
                return;
            }
            const fd = new FormData();
            fd.set('image', new File([blob], 'cizim.png', { type: 'image/png' }));
            const result = await saveDrawing(fd);
            setIsSaving(false);
            if (result.ok) {
                triggerReward({ message: 'Çizimin kaydedildi!' });
                handleClear();
                refreshGallery();
            }
        }, 'image/png');
    };

    return (
        <div className="min-h-screen bg-papatya-cream p-4 flex flex-col gap-4 items-center">
            <GameHud />
            <h1 className="text-p-2xl font-bold text-center">Çizim Tahtası</h1>
            <GameIntroCard gameId="drawing-board" variant="banner" />

            <canvas
                ref={canvasRef}
                width={600}
                height={450}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full max-w-2xl aspect-[4/3] bg-papatya-surface rounded-p-lg shadow-lg touch-none border-2 border-papatya-rule"
            />

            <div className="flex flex-wrap items-center gap-3 justify-center">
                {PALETTE.map((swatch) => (
                    <button
                        key={swatch.value}
                        type="button"
                        onClick={() => setColor(swatch.value)}
                        aria-label={swatch.name}
                        className={`w-10 h-10 rounded-full border-4 ${
                            color === swatch.value ? 'border-papatya-sky' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: swatch.value }}
                    />
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleUndo}
                    className="min-h-tap px-4 flex items-center gap-2 bg-papatya-surface rounded-p-md font-bold text-papatya-ink-soft"
                >
                    <Undo2 size={18} /> Geri al
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    className="min-h-tap px-4 flex items-center gap-2 bg-papatya-surface rounded-p-md font-bold text-papatya-ink-soft"
                >
                    <Trash2 size={18} /> Temizle
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-h-tap px-4 flex items-center gap-2 bg-papatya-sky text-white rounded-p-md font-bold disabled:opacity-50"
                >
                    <Save size={18} /> {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {gallery.length > 0 && (
                <div className="w-full max-w-2xl flex flex-col gap-2">
                    <h2 className="text-p-base font-bold text-papatya-ink-soft">Geçmiş çizimler</h2>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {gallery.map((drawing) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={drawing.id}
                                src={drawing.filePath}
                                alt="Geçmiş çizim"
                                className="w-full aspect-square object-cover rounded-p-md border border-papatya-rule"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
