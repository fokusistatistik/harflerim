import { create } from 'zustand';

/** ParentGate.tsx'teki TABS dizisindeki anahtarlarla aynı olmalı — burada ayrı tutulmasının nedeni store'un ParentGate.tsx'e bağımlı olmaması (döngüsel import'tan kaçınmak için). */
export type ParentGateTabKey =
    | 'genel'
    | 'aile'
    | 'muzik'
    | 'video'
    | 'cizimler'
    | 'profil'
    | 'duyusal'
    | 'sure'
    | 'ilerleme'
    | 'kayitlar';

/**
 * Faz 1.3 — ebeveyn kapısının açık/kapalı durumu. Tetikleyici (Header'daki
 * uzun basma jesti) ile görüntüleyici (ParentGate modalı) birbirinden
 * bağımsız kalsın diye merkezi bir store üzerinden haberleşir — tıpkı
 * notificationStore'daki toast kuyruğu gibi.
 *
 * 2026-09-15 — `requestedTab`: bir oyun ekranından ("en az 2 aile bireyi
 * eklemelisiniz" gibi) doğrudan ilgili sekmeye yönlendirme ihtiyacı
 * (family-album). PIN doğrulandıktan sonra ParentGate bu sekmeyi açar,
 * sonra sıfırlanır (bir sonraki manuel açılışta varsayılan "genel" kalsın).
 */
interface ParentGateState {
    isPinPromptOpen: boolean;
    isUnlocked: boolean;
    requestedTab: ParentGateTabKey | null;
    openPinPrompt: (requestedTab?: ParentGateTabKey) => void;
    closePinPrompt: () => void;
    unlock: () => void;
    lock: () => void;
    consumeRequestedTab: () => ParentGateTabKey | null;
}

export const useParentGateStore = create<ParentGateState>((set, get) => ({
    isPinPromptOpen: false,
    isUnlocked: false,
    requestedTab: null,
    openPinPrompt: (requestedTab) => set({ isPinPromptOpen: true, requestedTab: requestedTab ?? null }),
    closePinPrompt: () => set({ isPinPromptOpen: false, requestedTab: null }),
    unlock: () => set({ isUnlocked: true, isPinPromptOpen: false }),
    lock: () => set({ isUnlocked: false }),
    consumeRequestedTab: () => {
        const tab = get().requestedTab;
        set({ requestedTab: null });
        return tab;
    },
}));
