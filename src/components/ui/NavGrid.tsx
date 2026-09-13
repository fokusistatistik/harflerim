'use client';

import Link from 'next/link';
import {
    Mic,
    LayoutGrid,
    Music,
    Clapperboard,
    Images,
    Paintbrush,
    PenLine,
    MessageSquare,
    ShieldCheck,
    Lock,
    Puzzle,
} from 'lucide-react';
import { NAV_AREAS, type NavArea, type NavAccent } from '@/config/navAreas';
import { useParentGateStore } from '@/store/parentGateStore';

const ICONS: Record<string, typeof Mic> = {
    'magic-words': Mic,
    'memory-match': LayoutGrid,
    'visual-match': Puzzle,
    'music-corner': Music,
    cartoon: Clapperboard,
    'family-album': Images,
    'drawing-board': Paintbrush,
    'writing-practice': PenLine,
    'aac-board': MessageSquare,
    'parent-area': ShieldCheck,
};

/** papatya-* token sınıfları — accent başına sabit, ad-hoc renk eklenmez. */
const ACCENT_CLASSES: Record<NavAccent, { border: string; borderHover: string; iconBg: string; iconText: string; subtitleText: string }> = {
    petal: {
        border: 'border-papatya-petal/30',
        borderHover: 'hover:border-papatya-petal',
        iconBg: 'bg-papatya-petal/15',
        iconText: 'text-papatya-petal-deep',
        subtitleText: 'text-papatya-petal-deep',
    },
    leaf: {
        border: 'border-papatya-leaf/30',
        borderHover: 'hover:border-papatya-leaf',
        iconBg: 'bg-papatya-leaf/15',
        iconText: 'text-papatya-leaf',
        subtitleText: 'text-papatya-leaf',
    },
    sky: {
        border: 'border-papatya-sky/30',
        borderHover: 'hover:border-papatya-sky',
        iconBg: 'bg-papatya-sky/15',
        iconText: 'text-papatya-sky',
        subtitleText: 'text-papatya-sky',
    },
    rose: {
        border: 'border-papatya-rose/30',
        borderHover: 'hover:border-papatya-rose',
        iconBg: 'bg-papatya-rose/15',
        iconText: 'text-papatya-rose',
        subtitleText: 'text-papatya-rose',
    },
};

function CardShell({ area, children }: { area: NavArea; children: React.ReactNode }) {
    const accent = ACCENT_CLASSES[area.accent];
    const isSoon = area.status === 'soon';

    const inner = (
        <div
            className={`relative bg-papatya-surface border-4 rounded-p-lg p-4 flex flex-col items-center justify-center gap-3 h-full transition-all
                ${isSoon ? 'border-papatya-rule opacity-70' : `${accent.border} ${accent.borderHover} shadow-xl hover:shadow-2xl`}`}
        >
            {children}
            <div className="flex flex-col items-center text-center w-full px-2">
                <span className="text-p-base lg:text-p-lg font-bold text-papatya-ink leading-tight">{area.label}</span>
                <span className={`text-xs ${isSoon ? 'text-papatya-ink-soft' : accent.subtitleText}`}>{area.subtitle}</span>
            </div>
        </div>
    );

    const wrapperClass = 'group relative bg-papatya-surface p-1 rounded-p-lg aspect-square min-h-tap min-w-tap';

    if (area.status === 'active' && area.href) {
        return (
            <Link href={area.href} className={`${wrapperClass} transition-transform hover:scale-105 active:scale-95`}>
                {inner}
            </Link>
        );
    }

    if (area.status === 'parent-gate') {
        const openPinPrompt = useParentGateStore.getState().openPinPrompt;
        return (
            <button
                type="button"
                onClick={() => openPinPrompt()}
                className={`${wrapperClass} transition-transform hover:scale-105 active:scale-95 text-left`}
                aria-label={`${area.label} — ebeveyn PIN'i gerekli`}
            >
                {inner}
            </button>
        );
    }

    // status === 'soon': tıklanamaz, sakin ve kilitli görünür ama tamamen görünmez değil.
    return (
        <div className={wrapperClass} aria-disabled="true" title="Yakında">
            {inner}
        </div>
    );
}

export function NavGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8 w-full">
            {NAV_AREAS.map((area) => {
                const accent = ACCENT_CLASSES[area.accent];
                const Icon = ICONS[area.id];

                return (
                    <CardShell key={area.id} area={area}>
                        <div className="w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 relative">
                            {area.imageSrc ? (
                                <img src={area.imageSrc} alt={area.label} className="w-full h-full object-contain drop-shadow-lg" />
                            ) : (
                                <div className={`${accent.iconBg} ${accent.iconText} p-4 rounded-full`}>
                                    <Icon size={40} strokeWidth={2} />
                                </div>
                            )}
                            {area.status === 'soon' && (
                                <div className="absolute -bottom-1 -right-1 bg-papatya-surface border-2 border-papatya-rule rounded-full p-1.5 text-papatya-ink-soft">
                                    <Lock size={14} />
                                </div>
                            )}
                        </div>
                    </CardShell>
                );
            })}
        </div>
    );
}
