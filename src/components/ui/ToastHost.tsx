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
    // Yalnızca çocuğa yönelik (scope: 'child') toast'lar burada görünür.
    // 'parent' kapsamlı bildirimler henüz tüketicisi olmayan bir kuyrukta bekler
    // (bkz. src/store/notificationStore.ts) — sakinleştirme modu / rozet gibi
    // özellikler yazıldığında ayrı bir görünüm bu kuyruğa bağlanacak.
    const childToasts = useNotificationStore((s) => s.toasts.filter((t) => t.scope === 'child'));

    return (
        <div className="fixed top-20 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
            {childToasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
