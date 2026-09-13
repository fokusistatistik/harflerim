'use client';

import { useEffect } from 'react';
import { Info } from 'lucide-react';
import { useNotificationStore, type Toast } from '@/store/notificationStore';

const KIND_STYLES: Record<Toast['kind'], string> = {
    success: 'bg-papatya-leaf text-white',
    error: 'bg-papatya-rose text-white',
    info: 'bg-papatya-surface text-papatya-ink border border-papatya-rule',
};

function ToastItem({ toast }: { toast: Toast }) {
    const dismissToast = useNotificationStore((s) => s.dismissToast);

    useEffect(() => {
        const timer = setTimeout(() => dismissToast(toast.id), toast.durationMs);
        return () => clearTimeout(timer);
    }, [toast.id, toast.durationMs, dismissToast]);

    return (
        <div
            role="status"
            className={`px-5 py-3 rounded-p-md shadow-lg font-bold text-center pointer-events-auto transition-p-base ${KIND_STYLES[toast.kind]}`}
        >
            {toast.message}
        </div>
    );
}

/**
 * Faz 1.16 — 'parent' kapsamlı bildirimler (bkz. notificationStore.ts).
 * Çocuğa yönelik toast'lardan (üstte, ortada) kasıtlı olarak ayrı bir
 * konumda ve stilde: sağ üstte, "Ebeveyn Bildirimi" etiketiyle, papatya-sky
 * rengiyle — kimin için olduğu belirsizlik yaratmasın.
 */
function ParentToastItem({ toast }: { toast: Toast }) {
    const dismissToast = useNotificationStore((s) => s.dismissToast);

    useEffect(() => {
        const timer = setTimeout(() => dismissToast(toast.id), toast.durationMs);
        return () => clearTimeout(timer);
    }, [toast.id, toast.durationMs, dismissToast]);

    return (
        <div
            role="status"
            className="flex items-start gap-2 px-4 py-3 rounded-p-md shadow-lg pointer-events-auto transition-p-base bg-papatya-sky/15 border border-papatya-sky/40 text-papatya-ink max-w-xs"
        >
            <Info size={18} className="text-papatya-sky shrink-0 mt-0.5" />
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-papatya-sky">Ebeveyn Bildirimi</p>
                <p className="text-sm font-semibold">{toast.message}</p>
            </div>
        </div>
    );
}

export function ToastHost() {
    // Store'dan HAM diziyi seçiyoruz (yalnızca gerçek bir set() çağrısında referansı
    // değişir). Filtreyi burada, normal render içinde yapıyoruz — selector'ün
    // kendisi her çağrıldığında yeni bir dizi döndürseydi (ör. .filter() burada
    // olsaydı), useSyncExternalStore bunu "değişti" sanıp sonsuz render döngüsüne
    // girerdi ("Maximum update depth exceeded").
    const toasts = useNotificationStore((s) => s.toasts);
    const childToasts = toasts.filter((t) => t.scope === 'child');
    const parentToasts = toasts.filter((t) => t.scope === 'parent');

    return (
        <>
            <div className="fixed top-20 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
                {childToasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </div>

            <div className="fixed top-20 right-4 z-[60] flex flex-col items-end gap-2 pointer-events-none">
                {parentToasts.map((toast) => (
                    <ParentToastItem key={toast.id} toast={toast} />
                ))}
            </div>
        </>
    );
}
