import { create } from 'zustand';

/**
 * Faz 3.2b — Sakinleştirme Modu global durumu. `DayComplete`'in
 * `isDayComplete` deseniyle aynı: bir boolean, iki eylem. Kapanış yalnızca
 * `deactivate()` ile olur — çocuk kendi "Devam Edelim" dediğinde (bkz.
 * CalmingMode.tsx). Otomatik zaman aşımı/yönlendirme YOK — roadmap ilkesi:
 * "asla otomatik kilitlemeye dönüşmemeli."
 *
 * 2026-09-14 — kullanıcı bulgusu: "Devam Edelim"e basıp oyuna dönünce, İLK
 * yeni yanlış cevapta mod anında tekrar tetikleniyordu. Kök neden: geçmiş
 * yanlış zinciri (SkillAttempt kayıtları, bkz. detectErrorStreak) hiç
 * sıfırlanmıyordu — yalnızca ekran kapanıyordu, sunucu tarafı hâlâ eşiğin
 * üzerindeydi. `acknowledged` bunu client tarafında bastırır: mod
 * kapatıldığında true olur, `useCalmingModeMonitor` bu bayrak true olduğu
 * sürece yeniden tetiklemeyi kontrol etmeyi durdurur; yalnızca çocuk bir
 * sonraki DOĞRU cevabı verince (gerçekten toparladığının sinyali) bayrak
 * temizlenip normal kontrol devam eder.
 */
interface CalmingModeState {
    isActive: boolean;
    acknowledged: boolean;
    activate: () => void;
    deactivate: () => void;
    clearAcknowledged: () => void;
}

export const useCalmingModeStore = create<CalmingModeState>((set) => ({
    isActive: false,
    acknowledged: false,
    activate: () => set({ isActive: true, acknowledged: false }),
    deactivate: () => set({ isActive: false, acknowledged: true }),
    clearAcknowledged: () => set({ acknowledged: false }),
}));
