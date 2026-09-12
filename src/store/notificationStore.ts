import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

/// 'child': oyun içi anlık geri bildirim, ekrana toast olarak basılır.
/// 'parent': ebeveyne yönelik sistem bildirimi — sakinleştirme modu (3.2b) ve
/// rozet (2.8b) gibi özellikler henüz yazılmadığı için bu kanalın şu an
/// tüketicisi yok, kuyruk yalnızca gelecekteki bağlanma için hazır bekliyor.
export type ToastScope = 'child' | 'parent';

export interface Toast {
    id: string;
    scope: ToastScope;
    kind: ToastKind;
    message: string;
    durationMs: number;
}

interface NotificationState {
    toasts: Toast[];
    pushToast: (toast: Omit<Toast, 'id' | 'durationMs'> & { durationMs?: number }) => void;
    dismissToast: (id: string) => void;
}

const DEFAULT_DURATION_MS = 2600;

export const useNotificationStore = create<NotificationState>((set) => ({
    toasts: [],
    pushToast: ({ scope, kind, message, durationMs = DEFAULT_DURATION_MS }) => {
        const id = crypto.randomUUID();
        set((state) => ({ toasts: [...state.toasts, { id, scope, kind, message, durationMs }] }));
    },
    dismissToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));
