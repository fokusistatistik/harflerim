import { create } from 'zustand';

/**
 * Faz 1.3 — ebeveyn kapısının açık/kapalı durumu. Tetikleyici (Header'daki
 * uzun basma jesti) ile görüntüleyici (ParentGate modalı) birbirinden
 * bağımsız kalsın diye merkezi bir store üzerinden haberleşir — tıpkı
 * notificationStore'daki toast kuyruğu gibi.
 */
interface ParentGateState {
    isPinPromptOpen: boolean;
    isUnlocked: boolean;
    openPinPrompt: () => void;
    closePinPrompt: () => void;
    unlock: () => void;
    lock: () => void;
}

export const useParentGateStore = create<ParentGateState>((set) => ({
    isPinPromptOpen: false,
    isUnlocked: false,
    openPinPrompt: () => set({ isPinPromptOpen: true }),
    closePinPrompt: () => set({ isPinPromptOpen: false }),
    unlock: () => set({ isUnlocked: true, isPinPromptOpen: false }),
    lock: () => set({ isUnlocked: false }),
}));
