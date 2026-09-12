'use client';

import { useEffect } from 'react';
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

export function ToastHost() {
    // Store'dan HAM diziyi seçiyoruz (yalnızca gerçek bir set() çağrısında referansı
    // değişir). Filtreyi burada, normal render içinde yapıyoruz — selector'ün
    // kendisi her çağrıldığında yeni bir dizi döndürseydi (ör. .filter() burada
    // olsaydı), useSyncExternalStore bunu "değişti" sanıp sonsuz render döngüsüne
    // girerdi ("Maximum update depth exceeded").
    //
    // Yalnızca çocuğa yönelik (scope: 'child') toast'lar burada görünür.
    // 'parent' kapsamlı bildirimler henüz tüketicisi olmayan bir kuyrukta bekler
    // (bkz. src/store/notificationStore.ts) — sakinleştirme modu / rozet gibi
    // özellikler yazıldığında ayrı bir görünüm bu kuyruğa bağlanacak.
    const toasts = useNotificationStore((s) => s.toasts);
    const childToasts = toasts.filter((t) => t.scope === 'child');

    return (
        <div className="fixed top-20 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
            {childToasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
