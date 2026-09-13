import { create } from 'zustand';

/**
 * Faz 3.2b — Sakinleştirme Modu global durumu. `DayComplete`'in
 * `isDayComplete` deseniyle aynı: bir boolean, iki eylem. Kapanış yalnızca
 * `deactivate()` ile olur — çocuk kendi "Devam Edelim" dediğinde (bkz.
 * CalmingMode.tsx). Otomatik zaman aşımı/yönlendirme YOK — roadmap ilkesi:
 * "asla otomatik kilitlemeye dönüşmemeli."
 */
interface CalmingModeState {
    isActive: boolean;
    activate: () => void;
    deactivate: () => void;
}

export const useCalmingModeStore = create<CalmingModeState>((set) => ({
    isActive: false,
    activate: () => set({ isActive: true }),
    deactivate: () => set({ isActive: false }),
}));
