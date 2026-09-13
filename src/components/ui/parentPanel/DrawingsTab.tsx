'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { listDrawings, deleteDrawing, type DrawingData } from '@/actions/drawings';

/**
 * 2026-09-13 — audit'te bulundu: `drawings.ts`'nin `listDrawings`/
 * `deleteDrawing` action'ları zaten vardı ama hiçbir ebeveyn UI'ı bunları
 * çağırmıyordu — çocuğun çizdiklerini görmenin tek yolu yoktu. Yükleme
 * formu YOK, bilerek: çizimler yalnızca çocuk tarafında (DrawingBoard)
 * üretilir, burası yalnızca görüntüleme/arşiv temizliği.
 */
export function DrawingsTab() {
    const [drawings, setDrawings] = useState<DrawingData[]>([]);
    const [loaded, setLoaded] = useState(false);

    const refresh = () => {
        listDrawings().then((result) => {
            setDrawings(result);
            setLoaded(true);
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    const handleDelete = async (id: string) => {
        await deleteDrawing(id);
        refresh();
    };

    if (!loaded) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Yükleniyor...</p>;
    }

    if (drawings.length === 0) {
        return <p className="text-p-sm text-papatya-ink-soft text-center py-6">Henüz kaydedilmiş bir çizim yok.</p>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {drawings.map((drawing) => (
                <div key={drawing.id} className="relative bg-papatya-cream rounded-p-md p-2 flex flex-col gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={drawing.filePath}
                        alt="Çizim"
                        className="w-full aspect-square object-contain rounded-p-sm bg-white"
                    />
                    <p className="text-p-sm text-papatya-ink-soft text-center">
                        {new Date(drawing.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    <button
                        type="button"
                        onClick={() => handleDelete(drawing.id)}
                        className="absolute top-1 right-1 min-w-tap min-h-tap flex items-center justify-center bg-white/90 rounded-full text-papatya-rose shadow"
                        aria-label="Çizimi sil"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
