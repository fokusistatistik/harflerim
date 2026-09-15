import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';

interface DroppableProps {
    id: string;
    children: React.ReactNode;
    isMatched?: boolean;
}

export function Droppable({ id, children, isMatched }: DroppableProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            role="status"
            aria-live="polite"
            aria-label={isMatched ? 'Doğru eşleşme!' : undefined}
            className={clsx(
                "transition-all duration-p-base rounded-3xl flex items-center justify-center border-4",
                isMatched ? "border-papatya-leaf bg-papatya-leaf/20" : isOver ? "border-papatya-sky bg-papatya-sky/10 scale-105" : "border-papatya-rule bg-papatya-cream/50"
            )}
        >
            {children}
        </div>
    );
}
